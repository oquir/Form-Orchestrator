import { Xmark } from "reicon-react";
import { IconButton } from "../../atoms/IconButton/IconButton";
import { ScriptInput } from "../ScriptInput/ScriptInput";
import {
  CONSTANT_INPUT_CLASSES,
  REMOVE_BUTTON_CLASSES,
  ROW_CLASSES,
} from "./RuleEffectRow.constants";
import type { RuleEffectRowProps } from "./RuleEffectRow.types";

export function RuleEffectRow({ effect, knownNames, onChange, onRemove }: RuleEffectRowProps) {
  return (
    <li className={ROW_CLASSES}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {effect.kind === "script" ? (
          <ScriptInput
            id={`rule-effect-${effect.id}`}
            label="El valor pasa a ser lo que devuelva"
            value={effect.source}
            rows={3}
            knownNames={knownNames}
            placeholder="return {{base_gravable}} * 0.007;"
            onChange={(source) => onChange({ id: effect.id, kind: "script", source })}
          />
        ) : (
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-fg-muted">El valor pasa a ser fijo</span>
            <input
              type="text"
              value={String(effect.value)}
              onChange={(event) =>
                onChange({ id: effect.id, kind: "constant", value: event.target.value })
              }
              spellCheck={false}
              className={CONSTANT_INPUT_CLASSES}
            />
          </label>
        )}
      </div>

      <IconButton
        onClick={onRemove}
        aria-label="Quitar efecto"
        title="Quitar efecto"
        className={REMOVE_BUTTON_CLASSES}
      >
        <Xmark size={12} weight="Filled" />
      </IconButton>
    </li>
  );
}
