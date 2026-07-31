import type { RichTextLeaf } from "../../types/richText";
import { ALLOWED_PROTOCOLS } from "./richText.constants";
import type { MarkState, StyleLike } from "./richText.types";

export function safeHref(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;

  const trimmed: string = raw.trim();
  if (trimmed === "") return undefined;

  const candidates: string[] = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
    ? [trimmed]
    : [`https://${trimmed}`];

  for (const candidate of candidates) {
    try {
      const url: URL = new URL(candidate);
      if (ALLOWED_PROTOCOLS.includes(url.protocol)) return url.toString();
    } catch {
      // sigue: una URL que no parsea simplemente no se acepta
    }
  }

  return undefined;
}

export function marksFromStyle(style: StyleLike | undefined): MarkState {
  if (!style) return {};

  const marks: MarkState = {};
  const weight: string = (style.fontWeight ?? "").toLowerCase();
  const decoration: string = (style.textDecorationLine || style.textDecoration || "").toLowerCase();

  if (weight === "bold" || weight === "bolder" || Number.parseInt(weight, 10) >= 600) {
    marks.bold = true;
  }
  if ((style.fontStyle ?? "").toLowerCase() === "italic") marks.italic = true;
  if (decoration.includes("underline")) marks.underline = true;

  return marks;
}

export function sameMarks(a: RichTextLeaf, b: RichTextLeaf): boolean {
  return (
    Boolean(a.bold) === Boolean(b.bold) &&
    Boolean(a.italic) === Boolean(b.italic) &&
    Boolean(a.underline) === Boolean(b.underline) &&
    a.href === b.href
  );
}

export function mergeLeaves(leaves: RichTextLeaf[]): RichTextLeaf[] {
  const merged: RichTextLeaf[] = [];

  for (const leaf of leaves) {
    if (leaf.text === "") continue;

    const previous: RichTextLeaf | undefined = merged[merged.length - 1];

    if (previous && sameMarks(previous, leaf)) {
      previous.text += leaf.text;
      continue;
    }

    merged.push({ ...leaf });
  }

  return merged;
}

export function applyMarks(text: string, marks: MarkState): RichTextLeaf {
  const leaf: RichTextLeaf = { text };

  if (marks.bold) leaf.bold = true;
  if (marks.italic) leaf.italic = true;
  if (marks.underline) leaf.underline = true;
  if (marks.href) leaf.href = marks.href;

  return leaf;
}
