import type { FieldTypeBadgeProps } from "./FieldTypeBadge.types";

export function FieldTypeBadge({ type, as = "p" }: FieldTypeBadgeProps) {
  const Tag = as;
  return (
    <Tag className="text-[10px] font-medium uppercase text-slate-400 dark:text-neutral-500">
      {type}
    </Tag>
  );
}
