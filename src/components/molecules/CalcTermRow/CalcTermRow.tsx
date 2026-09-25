import { AngleDown2, Xmark } from "reicon-react";
import { IconButton } from "../../atoms/IconButton/IconButton";
import {
  CALC_SIGN_CHOICES,
  CYCLE_SUFFIX,
  REMOVE_BUTTON_CLASSES,
  ROW_CLASSES,
  SELECT_CHEVRON_CLASSES,
  SELECT_CLASSES,
  SIGN_ITEM_ACTIVE_CLASSES,
  SIGN_ITEM_BASE_CLASSES,
  SIGN_ITEM_INACTIVE_CLASSES,
  SIGN_TRACK_CLASSES,
} from "./CalcTermRow.constants";
import type { CalcTermRowProps } from "./CalcTermRow.types";

export function CalcTermRow({
  term,
  position,
  optionGroups,
  canRemove,
  selectRef,
  onSignChange,
  onFieldChange,
  onRemove,
}: CalcTermRowProps) {
  return (
    <li className={ROW_CLASSES}>
      <fieldset aria-label={`Signo del campo ${position}`} className={SIGN_TRACK_CLASSES}>
        {CALC_SIGN_CHOICES.map((choice) => (
          <button
            key={choice.sign}
            type="button"
            aria-pressed={term.sign === choice.sign}
            aria-label={choice.label}
            title={choice.label}
            onClick={() => onSignChange(choice.sign)}
            className={`${SIGN_ITEM_BASE_CLASSES} ${
              term.sign === choice.sign ? SIGN_ITEM_ACTIVE_CLASSES : SIGN_ITEM_INACTIVE_CLASSES
            }`}
          >
            {choice.symbol}
          </button>
        ))}
      </fieldset>

      <div className="relative min-w-0 flex-1">
        <select
          ref={selectRef}
          aria-label={`Campo ${position}`}
          value={term.fieldId ?? ""}
          onChange={(event) => onFieldChange(event.target.value)}
          className={SELECT_CLASSES}
        >
          <option value="" disabled>
            Elegí un campo…
          </option>
          {optionGroups.map((group) => (
            <optgroup key={group.id} label={group.label}>
              {group.options.map((option) => (
                <option key={option.fieldId} value={option.fieldId} disabled={option.createsCycle}>
                  {option.createsCycle ? `${option.label} ${CYCLE_SUFFIX}` : option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <AngleDown2 size={14} className={SELECT_CHEVRON_CLASSES} />
      </div>

      <IconButton
        onClick={onRemove}
        disabled={!canRemove}
        aria-label={`Quitar el campo ${position}`}
        title="Quitar"
        className={REMOVE_BUTTON_CLASSES}
      >
        <Xmark size={14} />
      </IconButton>
    </li>
  );
}
