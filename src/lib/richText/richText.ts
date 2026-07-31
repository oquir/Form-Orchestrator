import type { RichTextContent, RichTextLeaf, RichTextParagraph } from "../../types/richText";
import {
  BLOCK_TAGS,
  BREAK_TAG,
  DROPPED_TAGS,
  ELEMENT_NODE,
  LINK_TAG,
  MARK_TAGS,
  TEXT_NODE,
} from "./richText.constants";
import type { DomLike, MarkState } from "./richText.types";
import { applyMarks, marksFromStyle, mergeLeaves, safeHref } from "./richText.utils";

export function serializeRichText(root: DomLike): RichTextContent {
  const paragraphs: RichTextParagraph[] = [];
  let current: RichTextLeaf[] = [];

  function closeParagraph(force: boolean): void {
    const merged: RichTextLeaf[] = mergeLeaves(current);
    current = [];

    if (merged.length === 0 && !force) return;

    paragraphs.push({ type: "paragraph", children: merged.length > 0 ? merged : [{ text: "" }] });
  }

  function walk(node: DomLike, marks: MarkState): void {
    if (node.nodeType === TEXT_NODE) {
      const text: string = node.textContent ?? "";
      if (text !== "") current.push(applyMarks(text, marks));

      return;
    }

    if (node.nodeType !== ELEMENT_NODE) return;

    const tag: string = node.nodeName.toUpperCase();

    if (DROPPED_TAGS.includes(tag)) return;

    if (tag === BREAK_TAG) {
      closeParagraph(true);
      return;
    }

    let next: MarkState = { ...marks, ...marksFromStyle(node.style) };

    const markFromTag: keyof MarkState | undefined = MARK_TAGS[tag];
    if (markFromTag) next = { ...next, [markFromTag]: true };

    if (tag === LINK_TAG) {
      const href: string | undefined = safeHref(node.getAttribute?.("href"));
      next = href ? { ...next, href } : { ...next, href: undefined };
    }

    const isBlock: boolean = BLOCK_TAGS.includes(tag);
    if (isBlock) closeParagraph(false);

    for (let i = 0; i < node.childNodes.length; i += 1) {
      walk(node.childNodes[i], next);
    }

    if (isBlock) closeParagraph(false);
  }

  for (let i = 0; i < root.childNodes.length; i += 1) {
    walk(root.childNodes[i], {});
  }

  closeParagraph(false);

  return paragraphs.length > 0 ? paragraphs : [{ type: "paragraph", children: [{ text: "" }] }];
}

export function isEmptyRichText(content: RichTextContent | undefined): boolean {
  if (!content || content.length === 0) return true;

  return content.every((paragraph) => paragraph.children.every((leaf) => leaf.text.trim() === ""));
}

export function richTextToPlainText(content: RichTextContent | undefined): string {
  if (!content) return "";

  return content
    .map((paragraph) => paragraph.children.map((leaf) => leaf.text).join(""))
    .join("\n");
}

export function emptyRichText(): RichTextContent {
  return [{ type: "paragraph", children: [{ text: "" }] }];
}
