import {
  operatorIsStringBased,
  operatorTakesList,
  parseConditionList,
} from "../../../lib/fieldCondition/fieldCondition";
import type { FieldOption } from "../../../types/field";
import { FIELD_CLASSES, OPERATOR_VALUE_HINTS } from "./ConditionValueInput.constants";
import type { ConditionValueInputProps } from "./ConditionValueInput.types";

export function ConditionValueInput({
  condition,
  observedField,
  onChange,
}: ConditionValueInputProps) {
  const stringValue: string = condition.value === undefined ? "" : String(condition.value);
  const options: FieldOption[] = observedField?.options ?? [];
  const takesList: boolean = operatorTakesList(condition.operator);
  const isStringBased: boolean = operatorIsStringBased(condition.operator);
  const hint: string | undefined = OPERATOR_VALUE_HINTS[condition.operator];
  const isNumeric: boolean =
    observedField?.type === "number" || observedField?.type === "calculated";

  function toggleListEntry(optionId: string): void {
    const selected: string[] = parseConditionList(condition.value);
    const next: string[] = selected.includes(optionId)
      ? selected.filter((entry) => entry !== optionId)
      : [...selected, optionId];

    onChange(next.join(","));
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-fg-muted">Valor</span>

      {takesList && options.length > 0 ? (
        <div className="flex flex-col gap-1 rounded-md border border-border bg-field p-2">
          {options.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-xs text-fg">
              <input
                type="checkbox"
                checked={parseConditionList(condition.value).includes(option.id)}
                onChange={() => toggleListEntry(option.id)}
              />
              {option.label}
            </label>
          ))}
        </div>
      ) : options.length > 0 && !isStringBased ? (
        <select
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          className={FIELD_CLASSES}
        >
          <option value="">— Elegir —</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      ) : isNumeric && !isStringBased ? (
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
          spellCheck={false}
        />
      )}

      {hint && <p className="text-[11px] text-fg-subtle">{hint}</p>}
    </div>
  );
}
