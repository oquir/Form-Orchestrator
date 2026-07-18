import { FIELD_CLASSES } from "./ConditionValueInput.constants";
import type { ConditionValueInputProps } from "./ConditionValueInput.types";

export function ConditionValueInput({
  condition,
  observedField,
  onChange,
}: ConditionValueInputProps) {
  const stringValue: string = condition.value === undefined ? "" : String(condition.value);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-slate-500 dark:text-neutral-400">Valor</span>
      {observedField?.options && observedField.options.length > 0 ? (
        <select
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          className={FIELD_CLASSES}
        >
          <option value="">— Elegir —</option>
          {observedField.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      ) : observedField?.type === "number" || observedField?.type === "calculated" ? (
        <input
          type="number"
          value={stringValue}
          onChange={(event) => {
            const parsed = Number.parseFloat(event.target.value);
            onChange(Number.isNaN(parsed) ? "" : parsed);
          }}
          className={FIELD_CLASSES}
        />
      ) : (
        <input
          type="text"
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          className={FIELD_CLASSES}
        />
      )}
    </div>
  );
}
