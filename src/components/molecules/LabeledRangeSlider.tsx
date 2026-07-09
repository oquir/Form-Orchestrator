import { Label } from "../atoms/Label";

interface LabeledRangeSliderProps {
  id: string;
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export function LabeledRangeSlider({
  id,
  label,
  min,
  max,
  value,
  onChange,
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
        className="w-full"
      />
    </div>
  );
}
