import type { ReactNode } from "react";
import { safeHref } from "../../../lib/richText/richText.utils";
import type { RichTextLeaf } from "../../../types/richText";

export function renderLeaf(leaf: RichTextLeaf, key: number): ReactNode {
  let node: ReactNode = leaf.text;

  if (leaf.bold) node = <strong>{node}</strong>;
  if (leaf.italic) node = <em>{node}</em>;
  if (leaf.underline) node = <u>{node}</u>;

  const href: string | undefined = safeHref(leaf.href);
  if (href) {
    node = (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-fg underline">
        {node}
      </a>
    );
  }

  return <span key={key}>{node}</span>;
}
