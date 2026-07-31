import type { RichTextContent } from "../../../types/richText";

export interface RichTextEditorProps {
  value: RichTextContent | undefined;
  onChange: (content: RichTextContent) => void;
}

export type RichTextCommand = "bold" | "italic" | "underline";
