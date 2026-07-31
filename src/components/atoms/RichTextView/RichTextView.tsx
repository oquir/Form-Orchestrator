import type { ReactNode } from "react";
import { isEmptyRichText } from "../../../lib/richText/richText";
import { safeHref } from "../../../lib/richText/richText.utils";
import type { RichTextLeaf } from "../../../types/richText";
import type { RichTextViewProps } from "./RichTextView.types";

function renderLeaf(leaf: RichTextLeaf, key: number): ReactNode {
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

export function RichTextView({ content }: RichTextViewProps) {
  if (isEmptyRichText(content)) {
    return <p className="text-xs italic text-fg-subtle">Bloque de texto vacío</p>;
  }

  return (
    <div className="flex flex-col gap-1 text-xs text-fg-soft">
      {(content ?? []).map((paragraph, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: los parrafos no tienen id propio
        <p key={index}>
          {paragraph.children.map((leaf, leafIndex) => renderLeaf(leaf, leafIndex))}
        </p>
      ))}
    </div>
  );
}
