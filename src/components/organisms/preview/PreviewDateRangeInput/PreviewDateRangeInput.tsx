import { readDateRange, toDateRangeValue } from "../../../../lib/fieldDate/fieldDate";
import type { DateRangeValue } from "../../../../types/fieldDate";
import { PreviewDateInput } from "../PreviewDateInput/PreviewDateInput";
import {
  END_CAPTION_CLASSES,
  END_CLASSES,
  RANGE_GRID_CLASSES,
  RANGE_GRID_WITH_TIME_CLASSES,
} from "./PreviewDateRangeInput.constants";
import type { PreviewDateRangeInputProps } from "./PreviewDateRangeInput.types";

export function PreviewDateRangeInput({
  label,
  value,
  disabled,
  inputId,
  format,
  withTime,
  max,
  className,
  onChange,
}: PreviewDateRangeInputProps) {
  const range: DateRangeValue = readDateRange(value);

  function update(patch: Partial<DateRangeValue>): void {
    onChange(toDateRangeValue({ ...range, ...patch }));
  }

  return (
    <div className={withTime ? RANGE_GRID_WITH_TIME_CLASSES : RANGE_GRID_CLASSES}>
      <div className={END_CLASSES}>
        <span className={END_CAPTION_CLASSES}>Desde</span>
        <PreviewDateInput
          id={inputId}
          ariaLabel={`${label}: desde`}
          format={format}
          withTime={withTime}
          value={range.desde}
          max={range.hasta || max}
          disabled={disabled}
          className={className}
          onChange={(desde) => update({ desde })}
        />
      </div>

      <div className={END_CLASSES}>
        <span className={END_CAPTION_CLASSES}>Hasta</span>
        <PreviewDateInput
          ariaLabel={`${label}: hasta`}
          format={format}
          withTime={withTime}
          value={range.hasta}
          min={range.desde || undefined}
          max={max}
          disabled={disabled}
          className={className}
          onChange={(hasta) => update({ hasta })}
        />
      </div>
    </div>
  );
}
