import { useRef, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { useClickOutside } from "../../../hooks/useClickOutside/useClickOutside";
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
  align = "left",
  onChange,
}: ColorPickerFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  return (
    <div ref={containerRef} className="relative">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2 rounded-md border border-slate-200 px-1.5 py-1 focus-within:border-orange-500 dark:border-neutral-700 dark:bg-neutral-800 dark:focus-within:border-orange-400">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={`${label}: elegir del selector`}
          style={{ backgroundColor: value || defaultColor }}
          className="h-5 w-5 shrink-0 cursor-pointer rounded border border-slate-200 dark:border-neutral-600"
        />
        <HexColorInput
          id={id}
          color={value || defaultColor}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={`${label}: código hexadecimal`}
          spellCheck={false}
          className="w-full min-w-0 bg-transparent font-mono text-xs text-slate-700 uppercase outline-none dark:text-neutral-200"
        />
      </div>
      {/* El lado lo decide quien lo coloca porque el panel recorta: mide 320px con el riel y el
          padding adentro, el selector 200px fijos y cada columna 100px. Desde la columna derecha
          abrir hacia la derecha se sale 72px, y desde la izquierda abrir hacia la izquierda se sale
          16px. El overflow-y-auto del panel recorta tambien en X, asi que ningun z-index lo salva. */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1 rounded-md border border-slate-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <HexColorPicker color={value || defaultColor} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
