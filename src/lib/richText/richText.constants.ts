import type { MarkState } from "./richText.types";

export const TEXT_NODE = 3;
export const ELEMENT_NODE = 1;

export const ALLOWED_PROTOCOLS: string[] = ["http:", "https:", "mailto:"];

export const MARK_TAGS: Record<string, keyof MarkState> = {
  B: "bold",
  STRONG: "bold",
  I: "italic",
  EM: "italic",
  U: "underline",
  INS: "underline",
};

export const BLOCK_TAGS: string[] = ["DIV", "P", "LI", "TR"];

export const DROPPED_TAGS: string[] = ["SCRIPT", "STYLE", "HEAD", "NOSCRIPT", "TEMPLATE", "IFRAME"];

export const BREAK_TAG = "BR";
export const LINK_TAG = "A";
