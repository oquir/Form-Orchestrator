import type { ClipboardEvent, RefObject } from "react";
import type { RichTextCommand, RichTextContent } from "../../types/richText";

export interface UseRichTextEditorParams {
  value: RichTextContent | undefined;
  onChange: (content: RichTextContent) => void;
}

export interface UseRichTextEditorResult {
  editorRef: RefObject<HTMLDivElement | null>;
  linkOpen: boolean;
  linkValue: string;
  error: string;
  setLinkValue: (value: string) => void;
  emit: () => void;
  pastePlainText: (event: ClipboardEvent<HTMLDivElement>) => void;
  runCommand: (command: RichTextCommand) => void;
  openLinkInput: () => void;
  applyLink: () => void;
  cancelLink: () => void;
  removeLink: () => void;
}
