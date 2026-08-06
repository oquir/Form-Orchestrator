import { useEffect, useRef, useState } from "react";
import { serializeRichText } from "../../lib/richText/richText";
import { safeHref } from "../../lib/richText/richText.utils";
import type { RichTextCommand } from "../../types/richText";
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
