import { useEffect, useRef, useState } from "react";
import { serializeRichText } from "../../lib/richText/richText";
import { safeHref } from "../../lib/richText/richText.utils";
import type { RichTextCommand, RichTextContent } from "../../types/richText";
import { INVALID_URL_MESSAGE, NO_SELECTION_MESSAGE } from "./useRichTextEditor.constants";
import type { UseRichTextEditorParams, UseRichTextEditorResult } from "./useRichTextEditor.types";
import {
  currentSelectionRange,
  renderRichTextInto,
  restoreSelection,
} from "./useRichTextEditor.utils";

// El estado del editor de texto con formato. Pinta el modelo creando nodos, nunca por innerHTML, y
// lee de vuelta con serializeRichText, que es el que sanea. La seleccion se guarda antes de abrir el
// input del enlace porque mover el foco al input la pierde.
export function useRichTextEditor({
  value,
  onChange,
}: UseRichTextEditorParams): UseRichTextEditorResult {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRange = useRef<Range | null>(null);
  // El contenido que el DOM ya muestra: lo ultimo que se pinto o que el propio editor mando al store,
  // null antes del primer pintado. Se compara por referencia porque los paneles guardan tal cual el
  // contenido que reciben, asi que el eco de lo recien escrito vuelve como el mismo objeto.
  const shown = useRef<RichTextContent | undefined | null>(null);
  const [linkOpen, setLinkOpen] = useState<boolean>(false);
  const [linkValue, setLinkValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Se pinta al montar y cuando value llega distinto de lo que ya se muestra: deshacer o rehacer. El
  // eco de lo que se acaba de escribir no se repinta, porque eso moveria el cursor al final. Sin el
  // repintado, deshacer dejaria el texto viejo en pantalla y el siguiente blur lo volveria a escribir
  // en el store, pisando lo deshecho. Cambiar de campo sigue remontando: el panel pasa key={field.id}.
  useEffect(() => {
    if (!editorRef.current || value === shown.current) return;

    shown.current = value;
    renderRichTextInto(editorRef.current, value);
  }, [value]);

  function emit(): void {
    if (!editorRef.current) return;

    const content: RichTextContent = serializeRichText(editorRef.current);
    shown.current = content;
    onChange(content);
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

  function cancelLink(): void {
    setLinkOpen(false);
    setError("");
  }

  function removeLink(): void {
    editorRef.current?.focus();
    document.execCommand("unlink");
    emit();
  }

  return {
    editorRef,
    linkOpen,
    linkValue,
    error,
    setLinkValue,
    emit,
    runCommand,
    openLinkInput,
    applyLink,
    cancelLink,
    removeLink,
  };
}
