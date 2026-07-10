import { Label } from "../atoms/Label";

interface ColorPickerFieldProps {
  id: string;
  label: string;
  value: string;
  defaultColor: string;
  placeholder: string;
  onChange: (value: string) => void;
}

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
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value || defaultColor}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-10 rounded border border-slate-200 dark:border-slate-700"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 font-mono text-sm text-slate-700 focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-orange-400"
        />
      </div>
    </div>
  );
}
