export interface RichTextLeaf {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  href?: string;
}

export interface RichTextParagraph {
  type: "paragraph";
  children: RichTextLeaf[];
}

export type RichTextContent = RichTextParagraph[];

export type RichTextCommand = "bold" | "italic" | "underline";
