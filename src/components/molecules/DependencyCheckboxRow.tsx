import { Checkbox } from "../atoms/Checkbox";
import { FieldTypeBadge } from "../atoms/FieldTypeBadge";

interface DependencyCheckboxRowProps {
  label: string;
  type: string;
  checked: boolean;
  onChange: () => void;
}

export function DependencyCheckboxRow({
  label,
  type,
  checked,
  onChange,
}: DependencyCheckboxRowProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Checkbox renders a nested <input type="checkbox">
    <label className="flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 dark:border-neutral-700 dark:text-neutral-200">
      <Checkbox checked={checked} onChange={onChange} />
      <FieldTypeBadge type={type} as="span" />
      {label}
    </label>
  );
}
