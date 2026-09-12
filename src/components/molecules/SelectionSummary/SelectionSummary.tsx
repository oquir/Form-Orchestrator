import { HINT_CLASSES } from "../../../constants/uiClasses";
import type { SelectionSummaryProps } from "./SelectionSummary.types";

export function SelectionSummary({ fields }: SelectionSummaryProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className={HINT_CLASSES}>
        Las propiedades se editan de a un campo. Desde la barra del lienzo puedes mover la selección
        a otro paso o eliminarla.
      </p>
      <ul className="flex list-none flex-col gap-1">
        {fields.map((field) => (
          <li
            key={field.id}
            className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-2 py-1.5"
          >
            <span className="truncate text-xs text-fg">{field.label}</span>
            <code className="shrink-0 font-mono text-[10px] text-fg-subtle">{field.name}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
