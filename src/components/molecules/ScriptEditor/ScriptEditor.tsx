import { autocompletion, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { bracketMatching, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { linter } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { placeholder as cmPlaceholder, drawSelection, EditorView, keymap } from "@codemirror/view";
import { useEffect, useRef } from "react";
import { SCRIPT_HIGHLIGHT, SCRIPT_THEME } from "./ScriptEditor.constants";
import type { ScriptEditorProps } from "./ScriptEditor.types";
import {
  fieldRefHighlighter,
  scriptCompletions,
  unknownRefDiagnostics,
} from "./ScriptEditor.utils";

export function ScriptEditor({
  id,
  ariaLabel,
  value,
  knownNames,
  placeholder,
  minHeight = "10rem",
  onChange,
}: ScriptEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  // Lo que cambia en cada render viaja por ref y no por dependencia del efecto: si el editor se
  // recreara al cambiar el callback o la lista de campos, se perderia el cursor en cada tecla.
  const onChangeRef = useRef(onChange);
  const knownNamesRef = useRef(knownNames);

  useEffect(() => {
    onChangeRef.current = onChange;
    knownNamesRef.current = knownNames;
  });

  // Solo al montar. `value` es el contenido inicial y de ahi en mas lo sostiene CodeMirror -- el
  // efecto de abajo trae los cambios de afuera --, y el id, la etiqueta y el placeholder no cambian
  // mientras el panel vive. Depender de cualquiera de los cuatro rearmaria el editor entero.
  // biome-ignore lint/correctness/useExhaustiveDependencies: rearmar el editor tiraria el cursor
  useEffect(() => {
    const host: HTMLDivElement | null = hostRef.current;
    if (!host) return;

    const view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          javascript(),
          syntaxHighlighting(SCRIPT_HIGHLIGHT),
          autocompletion({ override: [scriptCompletions(() => knownNamesRef.current)] }),
          linter((target) => unknownRefDiagnostics(target, knownNamesRef.current)),
          fieldRefHighlighter(() => knownNamesRef.current),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ id, "aria-label": ariaLabel }),
          ...(placeholder ? [cmPlaceholder(placeholder)] : []),
          keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
          SCRIPT_THEME,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
        ],
      }),
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // Cambios que vienen de afuera -- el insertador de campos, cargar un borrador, cambiar de campo
  // seleccionado. La comparacion es lo que impide pisar el documento mientras alguien escribe.
  useEffect(() => {
    const view: EditorView | null = viewRef.current;
    if (!view || view.state.doc.toString() === value) return;

    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
  }, [value]);

  return <div ref={hostRef} style={{ minHeight }} className="[&_.cm-editor]:min-h-[inherit]" />;
}
