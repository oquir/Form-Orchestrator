import { useRichTextEditor } from "../../../hooks/useRichTextEditor/useRichTextEditor";
import {
  EDITOR_CLASSES,
  ERROR_CLASSES,
  FORMAT_BUTTONS,
  HINT_CLASSES,
  LINK_INPUT_CLASSES,
  TOOL_BUTTON_CLASSES,
  TOOLBAR_CLASSES,
} from "./RichTextEditor.constants";
import type { RichTextEditorProps } from "./RichTextEditor.types";

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useRichTextEditor({ value, onChange });

  return (
    <div className="flex flex-col gap-1.5">
      <div className={TOOLBAR_CLASSES}>
        {FORMAT_BUTTONS.map((button) => (
          <button
            key={button.command}
            type="button"
            title={button.title}
            onClick={() => editor.runCommand(button.command)}
            className={TOOL_BUTTON_CLASSES}
          >
            {button.label}
          </button>
        ))}
        <button
          type="button"
          title="Insertar enlace"
          onClick={editor.openLinkInput}
          className={TOOL_BUTTON_CLASSES}
        >
          Enlace
        </button>
        <button
          type="button"
          title="Quitar enlace"
          onClick={editor.removeLink}
          className={TOOL_BUTTON_CLASSES}
        >
          Quitar
        </button>
      </div>

      {editor.linkOpen && (
        <div className="flex items-center gap-1">
          <input
            // biome-ignore lint/a11y/noAutofocus: el campo aparece por accion explicita del usuario
            autoFocus
            value={editor.linkValue}
            placeholder="https://…"
            onChange={(event) => editor.setLinkValue(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && editor.applyLink()}
            className={LINK_INPUT_CLASSES}
          />
          <button type="button" onClick={editor.applyLink} className={TOOL_BUTTON_CLASSES}>
            Aplicar
          </button>
          <button type="button" onClick={editor.cancelLink} className={TOOL_BUTTON_CLASSES}>
            Cancelar
          </button>
        </div>
      )}

      {/* biome-ignore lint/a11y/useSemanticElements: un textarea no admite formato en linea */}
      <div
        ref={editor.editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        tabIndex={0}
        aria-multiline="true"
        aria-label="Contenido con formato"
        onInput={editor.emit}
        onBlur={editor.emit}
        className={EDITOR_CLASSES}
      />

      {editor.error ? (
        <span className={ERROR_CLASSES}>{editor.error}</span>
      ) : (
        <span className={HINT_CLASSES}>
          El texto pegado conserva negrita, cursiva, subrayado y enlaces; el resto del formato se
          descarta.
        </span>
      )}
    </div>
  );
}
