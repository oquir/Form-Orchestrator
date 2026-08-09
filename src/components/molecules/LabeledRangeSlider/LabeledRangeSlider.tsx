import { Label } from "../../atoms/Label/Label";
import type { LabeledRangeSliderProps } from "./LabeledRangeSlider.types";

export function LabeledRangeSlider({
  id,
  label,
  min,
  max,
  value,
  onChange,
  minLabel,
  maxLabel,
}: LabeledRangeSliderProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full cursor-grab accent-brand active:cursor-grabbing"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-[10px] text-fg-subtle">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
