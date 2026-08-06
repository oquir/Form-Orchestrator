import { emptyRichText } from "../../lib/richText/richText";
import { safeHref } from "../../lib/richText/richText.utils";
import type { RichTextContent, RichTextLeaf } from "../../types/richText";

function wrap(tag: string, child: Node): Node {
  const element: HTMLElement = document.createElement(tag);
  element.appendChild(child);

  return element;
}

function leafToNode(leaf: RichTextLeaf): Node {
  let node: Node = document.createTextNode(leaf.text);

  if (leaf.bold) node = wrap("b", node);
  if (leaf.italic) node = wrap("i", node);
  if (leaf.underline) node = wrap("u", node);

  const href: string | undefined = safeHref(leaf.href);
  if (href) {
    const anchor: HTMLAnchorElement = document.createElement("a");
    anchor.href = href;
    anchor.appendChild(node);
    node = anchor;
  }

  return node;
}

export function renderRichTextInto(root: HTMLElement, content: RichTextContent | undefined): void {
  const paragraphs: RichTextContent = content && content.length > 0 ? content : emptyRichText();

  root.replaceChildren();

  paragraphs.forEach((paragraph, index) => {
    if (index > 0) root.appendChild(document.createElement("br"));
    for (const leaf of paragraph.children) {
      if (leaf.text !== "") root.appendChild(leafToNode(leaf));
    }
  });
}

export function currentSelectionRange(): Range | null {
  const selection: Selection | null = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

  return selection.getRangeAt(0).cloneRange();
}

export function restoreSelection(range: Range | null): void {
  if (!range) return;

  const selection: Selection | null = window.getSelection();
  if (!selection) return;

  selection.removeAllRanges();
  selection.addRange(range);
}
