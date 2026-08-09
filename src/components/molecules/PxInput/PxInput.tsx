import { Input } from "../../atoms/Input/Input";
import { Label } from "../../atoms/Label/Label";
import type { PxInputProps } from "./PxInput.types";
import { toPxAmount } from "./PxInput.utils";

export function PxInput({ id, label, value, onChange }: PxInputProps) {
  const amount: string | null = toPxAmount(value);

  // Con otra unidad se edita como texto libre: el sufijo fijo diria "px" al lado de un "1rem" y el
  // numero de al lado seria mentira.
  if (amount === null) {
    return (
      <div>
        <Label htmlFor={id}>{label}</Label>
        <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center rounded-md border border-slate-200 pr-2.5 focus-within:border-orange-500 dark:border-neutral-700 dark:bg-neutral-800 dark:focus-within:border-orange-400">
        <input
          id={id}
          type="number"
          min={0}
          value={amount}
          onChange={(event) => onChange(event.target.value === "" ? "" : `${event.target.value}px`)}
          className="w-full min-w-0 rounded-md bg-transparent px-2.5 py-1.5 text-sm text-slate-700 outline-none dark:text-neutral-200"
        />
        <span className="shrink-0 text-xs text-fg-subtle">px</span>
      </div>
    </div>
  );
}
