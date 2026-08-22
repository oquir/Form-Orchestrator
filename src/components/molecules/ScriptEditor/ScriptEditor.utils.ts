import type { Completion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import type { Diagnostic } from "@codemirror/lint";
import { RangeSetBuilder } from "@codemirror/state";
import type { DecorationSet, EditorView, ViewUpdate } from "@codemirror/view";
import { Decoration, ViewPlugin } from "@codemirror/view";
import { SCRIPT_CONTEXT_PARAMS, SCRIPT_HELPER_NAMES } from "../../../constants/fieldScript";
import { compileScript } from "../../../lib/fieldScript/fieldScript";
import type { ScriptRef } from "../../../types/fieldScript";

// Las tres extensiones que saben del lenguaje del proyecto: pintar las referencias, ofrecerlas al
// autocompletar y avisar de las que no existen. Todas leen los nombres con un getter y no con un
// valor: las extensiones se crean una sola vez al montar, y recrearlas cuando alguien agrega un
// campo tiraria el estado del editor -- cursor, historial, el desplegable abierto.

const KNOWN_MARK = Decoration.mark({ class: "cm-field-ref" });
const UNKNOWN_MARK = Decoration.mark({ class: "cm-field-ref-unknown" });

function scriptRefs(source: string, knownNames: Set<string>): ScriptRef[] {
  return compileScript(source, knownNames).refs;
}

function buildDecorations(view: EditorView, knownNames: Set<string>): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();

  // El recorrido devuelve las referencias en orden de documento, que es lo que RangeSetBuilder
  // exige; construir el set con rangos desordenados lanza.
  for (const ref of scriptRefs(view.state.doc.toString(), knownNames)) {
    builder.add(ref.start, ref.end, ref.known ? KNOWN_MARK : UNKNOWN_MARK);
  }

  return builder.finish();
}

export function fieldRefHighlighter(getKnownNames: () => Set<string>) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = buildDecorations(view, getKnownNames());
      }

      update(update: ViewUpdate): void {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = buildDecorations(update.view, getKnownNames());
        }
      }
    },
    { decorations: (plugin) => plugin.decorations },
  );
}

// Al aceptar se cierra la llave, salvo que ya este cerrada: si no, escribir "{" con el cierre
// automatico de brackets y despues elegir del desplegable dejaria "{ingresos}}".
function applyFieldRef(name: string) {
  return (view: EditorView, _completion: Completion, from: number, to: number): void => {
    const alreadyClosed: boolean = view.state.doc.sliceString(to, to + 1) === "}";
    const insert: string = alreadyClosed ? name : `${name}}`;

    view.dispatch({
      changes: { from, to, insert },
      selection: { anchor: from + name.length + 1 },
    });
  };
}

export function scriptCompletions(getKnownNames: () => Set<string>) {
  const scopeOptions: Completion[] = [
    ...SCRIPT_CONTEXT_PARAMS.slice(1).map((name) => ({
      label: name,
      type: "variable",
    })),
    ...SCRIPT_HELPER_NAMES.map((name) => ({ label: name, type: "function" })),
  ];

  return (context: CompletionContext): CompletionResult | null => {
    const insideBraces = context.matchBefore(/\{[A-Za-z0-9_]*/);

    if (insideBraces) {
      return {
        from: insideBraces.from + 1,
        options: [...getKnownNames()].map((name) => ({
          label: name,
          type: "variable",
          apply: applyFieldRef(name),
        })),
        validFor: /^[A-Za-z0-9_]*$/,
      };
    }

    const word = context.matchBefore(/\w+/);
    if (!word || (word.from === word.to && !context.explicit)) return null;

    return { from: word.from, options: scopeOptions, validFor: /^\w*$/ };
  };
}

// Solo se marcan las referencias desconocidas. El error de sintaxis se reporta como texto en el
// panel y no aca: el editor solo tiene la fuente con {campo}, que no es JS, y lo que de verdad se
// compila es la version sustituida, donde las posiciones ya no coinciden con las de esta.
export function unknownRefDiagnostics(view: EditorView, knownNames: Set<string>): Diagnostic[] {
  return scriptRefs(view.state.doc.toString(), knownNames)
    .filter((ref) => !ref.known)
    .map((ref) => ({
      from: ref.start,
      to: ref.end,
      severity: "warning" as const,
      message: `{${ref.name}} no coincide con ningún campo: se deja tal cual como JavaScript.`,
    }));
}
