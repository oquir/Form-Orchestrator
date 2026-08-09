import { Label } from "../../atoms/Label/Label";
import type { ColorPickerFieldProps } from "./ColorPickerField.types";

// La muestra va dentro del mismo marco que el hex y no al lado: son dos formas de escribir el mismo
// dato, y separadas se leian como dos controles distintos.
export function ColorPickerField({
  id,
  label,
  value,
  defaultColor,
  placeholder,
  onChange,
}: ColorPickerFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2 rounded-md border border-slate-200 px-1.5 py-1 focus-within:border-orange-500 dark:border-neutral-700 dark:bg-neutral-800 dark:focus-within:border-orange-400">
        <input
          id={id}
          type="color"
          value={value || defaultColor}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label}: elegir del selector`}
          className="h-5 w-5 shrink-0 cursor-pointer rounded border border-slate-200 bg-transparent p-0 dark:border-neutral-600"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={`${label}: código hexadecimal`}
          spellCheck={false}
          className="w-full min-w-0 bg-transparent font-mono text-xs text-slate-700 uppercase outline-none dark:text-neutral-200"
        />
      </div>
    </div>
  );
}
