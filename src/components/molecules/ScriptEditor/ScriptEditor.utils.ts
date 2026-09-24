import type { Completion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import type { Diagnostic } from "@codemirror/lint";
import { RangeSetBuilder } from "@codemirror/state";
import type { DecorationSet, EditorView, ViewUpdate } from "@codemirror/view";
import { Decoration, ViewPlugin } from "@codemirror/view";
import { SCRIPT_CONTEXT_PARAMS, SCRIPT_HELPER_NAMES } from "../../../constants/fieldScript";
import { compileScript, fieldRefText } from "../../../lib/fieldScript/fieldScript";
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

// Al aceptar se cierran las llaves que falten. Escribir "{{" con el cierre automatico de brackets
// deja "{{|}}", y sin mirar lo que ya hay despues del cursor quedaria "{{ingresos}}}}".
function applyFieldRef(name: string) {
  return (view: EditorView, _completion: Completion, from: number, to: number): void => {
    const after: string = view.state.doc.sliceString(to, to + 2);
    const closing: string = after === "}}" ? "" : after.startsWith("}") ? "}" : "}}";

    view.dispatch({
      changes: { from, to, insert: `${name}${closing}` },
      selection: { anchor: from + name.length + 2 },
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
    // Dentro de {{ solo campos. Una llave sola ya no abre la lista: es JS -- un bloque, un
    // objeto -- y ofrecer campos ahi hacia que el Enter para saltar de linea metiera uno.
    const insideRef = context.matchBefore(/\{\{[ \t]*\w*/);

    if (insideRef) {
      const typed: number = /\w*$/.exec(insideRef.text)?.[0].length ?? 0;

      return {
        from: insideRef.to - typed,
        options: [...getKnownNames()].map((name) => ({
          label: name,
          type: "variable",
          apply: applyFieldRef(name),
        })),
        validFor: /^\w*$/,
      };
    }

    const word = context.matchBefore(/\w+/);

    // Ctrl+Espacio muestra todo lo que se puede usar aca, y los campos entran ya envueltos en sus
    // llaves. Mientras se escribe solo salen las funciones: con los campos en cada palabra, un
    // Enter al final del nombre de una variable la cambiaria por un campo.
    if (context.explicit) {
      return {
        from: word?.from ?? context.pos,
        options: [
          ...scopeOptions,
          ...[...getKnownNames()].map((name) => ({
            label: name,
            type: "variable",
            detail: "campo",
            apply: fieldRefText(name),
          })),
        ],
        validFor: /^\w*$/,
      };
    }

    if (!word) return null;

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
