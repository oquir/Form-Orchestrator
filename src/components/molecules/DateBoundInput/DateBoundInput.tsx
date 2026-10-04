import type { DateBoundUnit } from "../../../types/fieldDate";
import { Label } from "../../atoms/Label/Label";
import {
  CONTROL_CLASSES,
  DATE_CONTROL_CLASSES,
  MODE_OPTIONS,
  UNIT_OPTIONS,
} from "./DateBoundInput.constants";
import type { DateBoundInputProps, DateBoundMode } from "./DateBoundInput.types";
import { boundForMode, boundMode } from "./DateBoundInput.utils";

export function DateBoundInput({ id, label, bound, onChange }: DateBoundInputProps) {
  const mode: DateBoundMode = boundMode(bound);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>

      <select
        id={id}
        value={mode}
        onChange={(event) => onChange(boundForMode(event.target.value as DateBoundMode, bound))}
        className={CONTROL_CLASSES}
      >
        {MODE_OPTIONS.map((option) => (
          <option key={option.mode} value={option.mode}>
            {option.label}
          </option>
        ))}
      </select>

      {bound?.kind === "relative" && (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={1}
            step={1}
            aria-label={`${label}: cantidad`}
            value={bound.amount}
            onChange={(event) => {
              const amount: number = Number.parseInt(event.target.value, 10);
              onChange({ ...bound, amount: Number.isNaN(amount) ? 0 : Math.max(0, amount) });
            }}
            className={CONTROL_CLASSES}
          />
          <select
            aria-label={`${label}: unidad`}
            value={bound.unit}
            onChange={(event) => onChange({ ...bound, unit: event.target.value as DateBoundUnit })}
            className={CONTROL_CLASSES}
          >
            {UNIT_OPTIONS.map((option) => (
              <option key={option.unit} value={option.unit}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {bound?.kind === "fixed" && (
        <input
          type="date"
          aria-label={`${label}: fecha`}
          max="9999-12-31"
          value={bound.date}
          onChange={(event) => onChange({ ...bound, date: event.target.value })}
          className={DATE_CONTROL_CLASSES}
        />
      )}
    </div>
  );
}
