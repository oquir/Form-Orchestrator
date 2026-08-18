import { isEmptyRichText } from "../../../lib/richText/richText";
import type { RichTextViewProps } from "./RichTextView.types";
import { renderLeaf } from "./RichTextView.utils";

export function RichTextView({ content, className }: RichTextViewProps) {
  if (isEmptyRichText(content)) {
    return <p className="text-xs italic text-fg-subtle">Bloque de texto vacío</p>;
  }

  return (
    <div className={`flex flex-col gap-1 ${className ?? "text-xs text-fg-soft"}`}>
      {(content ?? []).map((paragraph, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: los parrafos no tienen id propio
        <p key={index}>
          {paragraph.children.map((leaf, leafIndex) => renderLeaf(leaf, leafIndex))}
        </p>
      ))}
    </div>
  );
}
