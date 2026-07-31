import { useEffect, useRef, useState } from "react";
import { serializeRichText } from "../../../lib/richText/richText";
import { safeHref } from "../../../lib/richText/richText.utils";
import {
  EDITOR_CLASSES,
  ERROR_CLASSES,
  FORMAT_BUTTONS,
  HINT_CLASSES,
  INVALID_URL_MESSAGE,
  LINK_INPUT_CLASSES,
  TOOL_BUTTON_CLASSES,
  TOOLBAR_CLASSES,
} from "./RichTextEditor.constants";
import type { RichTextCommand, RichTextEditorProps } from "./RichTextEditor.types";
import {
  currentSelectionRange,
  renderRichTextInto,
  restoreSelection,
} from "./RichTextEditor.utils";

const NO_SELECTION_MESSAGE = "Seleccioná primero el texto que querés enlazar.";

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRange = useRef<Range | null>(null);
  const [linkOpen, setLinkOpen] = useState<boolean>(false);
  const [linkValue, setLinkValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Solo al montar: repintar en cada cambio moveria el cursor al final mientras se escribe.
  // El panel pasa key={field.id}, asi que cambiar de campo remonta y vuelve a pintar.
  // biome-ignore lint/correctness/useExhaustiveDependencies: depender de value romperia el cursor
  useEffect(() => {
    if (editorRef.current) renderRichTextInto(editorRef.current, value);
  }, []);

  function emit(): void {
    if (editorRef.current) onChange(serializeRichText(editorRef.current));
  }

  function runCommand(command: RichTextCommand): void {
    editorRef.current?.focus();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(command);
    emit();
  }

  function openLinkInput(): void {
    const range: Range | null = currentSelectionRange();

    if (!range) {
      setError(NO_SELECTION_MESSAGE);
      return;
    }

    savedRange.current = range;
    setError("");
    setLinkValue("");
    setLinkOpen(true);
  }

  function applyLink(): void {
    const href: string | undefined = safeHref(linkValue);

    if (!href) {
      setError(INVALID_URL_MESSAGE);
      return;
    }

    editorRef.current?.focus();
    restoreSelection(savedRange.current);
    document.execCommand("createLink", false, href);
    savedRange.current = null;
    setLinkOpen(false);
    setError("");
    emit();
  }

  function removeLink(): void {
    editorRef.current?.focus();
    document.execCommand("unlink");
    emit();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className={TOOLBAR_CLASSES}>
        {FORMAT_BUTTONS.map((button) => (
          <button
            key={button.command}
            type="button"
            title={button.title}
            onClick={() => runCommand(button.command)}
            className={TOOL_BUTTON_CLASSES}
          >
            {button.label}
          </button>
        ))}
        <button
          type="button"
          title="Insertar enlace"
          onClick={openLinkInput}
          className={TOOL_BUTTON_CLASSES}
        >
          Enlace
        </button>
        <button
          type="button"
          title="Quitar enlace"
          onClick={removeLink}
          className={TOOL_BUTTON_CLASSES}
        >
          Quitar
        </button>
      </div>

      {linkOpen && (
        <div className="flex items-center gap-1">
          <input
            // biome-ignore lint/a11y/noAutofocus: el campo aparece por accion explicita del usuario
            autoFocus
            value={linkValue}
            placeholder="https://…"
            onChange={(event) => setLinkValue(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && applyLink()}
            className={LINK_INPUT_CLASSES}
          />
          <button type="button" onClick={applyLink} className={TOOL_BUTTON_CLASSES}>
            Aplicar
          </button>
          <button
            type="button"
            onClick={() => {
              setLinkOpen(false);
              setError("");
            }}
            className={TOOL_BUTTON_CLASSES}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* biome-ignore lint/a11y/useSemanticElements: un textarea no admite formato en linea */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        tabIndex={0}
        aria-multiline="true"
        aria-label="Contenido con formato"
        onInput={emit}
        onBlur={emit}
        className={EDITOR_CLASSES}
      />

      {error ? (
        <span className={ERROR_CLASSES}>{error}</span>
      ) : (
        <span className={HINT_CLASSES}>
          El texto pegado conserva negrita, cursiva, subrayado y enlaces; el resto del formato se
          descarta.
        </span>
      )}
    </div>
  );
}
