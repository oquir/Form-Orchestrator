import { Xmark } from "reicon-react";
import { IconButton } from "../../atoms/IconButton/IconButton";
import { FormulaInput } from "../FormulaInput/FormulaInput";
import type { RuleEffectRowProps } from "./RuleEffectRow.types";

export function RuleEffectRow({
  effect,
  candidates,
  selfName,
  onChange,
  onRemove,
}: RuleEffectRowProps) {
  return (
    <li className="flex items-start gap-2 rounded-md border border-border-subtle bg-surface p-2">
      <div className="flex flex-1 flex-col gap-1">
        {effect.kind === "formula" ? (
          <FormulaInput
            id={`rule-effect-${effect.id}`}
            label="El valor pasa a ser la fórmula"
            value={effect.expression}
            candidates={candidates}
            selfName={selfName}
            placeholder="base_gravable * 0.007"
            onChange={(expression) => onChange({ id: effect.id, kind: "formula", expression })}
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
              className="rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border"
            />
          </label>
        )}
      </div>

      <IconButton onClick={onRemove} title="Quitar efecto">
        <Xmark size={12} weight="Filled" />
      </IconButton>
    </li>
  );
}
