import { ArrowDown, ArrowUp, Trash6 } from "reicon-react";
import { createConstantEffect, createScriptEffect } from "../../../lib/fieldRule/fieldRule";
import { IconButton } from "../../atoms/IconButton/IconButton";
import { RuleConditionRow } from "../RuleConditionRow/RuleConditionRow";
import { RuleEffectRow } from "../RuleEffectRow/RuleEffectRow";
import {
  ADD_LINK_CLASSES,
  BLOCK_CLASSES,
  BLOCK_TITLE_CLASSES,
  CARD_CLASSES,
  DELETE_BUTTON_CLASSES,
  HEADER_CLASSES,
  HINT_CLASSES,
  ICON_BUTTON_CLASSES,
  MATCH_SELECT_CLASSES,
  NAME_INPUT_CLASSES,
  NUMBER_BADGE_CLASSES,
  WARNING_CLASSES,
} from "./FieldRuleCard.constants";
import type { FieldRuleCardProps } from "./FieldRuleCard.types";

export function FieldRuleCard({
  rule,
  index,
  rulesCount,
  rules,
  candidates,
  knownNames,
  nameInputRef,
}: FieldRuleCardProps) {
  const position: number = index + 1;

  return (
    <li className={CARD_CLASSES}>
      <div className={HEADER_CLASSES}>
        <span className={NUMBER_BADGE_CLASSES}>{position}</span>
        <input
          ref={nameInputRef}
          type="text"
          aria-label={`Nombre de la regla ${position}`}
          value={rule.label ?? ""}
          onChange={(event) => rules.setRuleLabel(rule.id, event.target.value)}
          placeholder="Nombre de la regla (opcional)"
          className={NAME_INPUT_CLASSES}
        />
        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton
            onClick={() => rules.moveRule(rule.id, -1)}
            disabled={index === 0}
            aria-label={`Subir la regla ${position}`}
            title="Subir"
            className={ICON_BUTTON_CLASSES}
          >
            <ArrowUp size={14} />
          </IconButton>
          <IconButton
            onClick={() => rules.moveRule(rule.id, 1)}
            disabled={index === rulesCount - 1}
            aria-label={`Bajar la regla ${position}`}
            title="Bajar"
            className={ICON_BUTTON_CLASSES}
          >
            <ArrowDown size={14} />
          </IconButton>
          <IconButton
            onClick={() => rules.removeRule(rule.id)}
            aria-label={`Eliminar la regla ${position}`}
            title="Eliminar regla"
            className={DELETE_BUTTON_CLASSES}
          >
            <Trash6 size={14} />
          </IconButton>
        </div>
      </div>

      <div className={BLOCK_CLASSES}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={BLOCK_TITLE_CLASSES}>Cuándo aplica</span>
          {rule.when.length > 1 && (
            <label className="flex items-center gap-2 text-[11px] text-fg-muted">
              Se cumple si
              <select
                value={rule.matchAll ? "todas" : "alguna"}
                onChange={(event) => rules.setRuleMatchAll(rule.id, event.target.value === "todas")}
                className={MATCH_SELECT_CLASSES}
              >
                <option value="todas">todas las condiciones</option>
                <option value="alguna">alguna condición</option>
              </select>
            </label>
          )}
        </div>

        {rule.when.length === 0 ? (
          <p className={HINT_CLASSES}>Sin condiciones: la regla aplica siempre.</p>
        ) : (
          <ul className="flex list-none flex-col gap-2">
            {rule.when.map((condition) => (
              <RuleConditionRow
                key={condition.id}
                condition={condition}
                candidates={candidates}
                onFieldChange={(fieldId) => rules.setConditionField(rule.id, condition.id, fieldId)}
                onUpdate={(updates) => rules.updateCondition(rule.id, condition.id, updates)}
                onRemove={() => rules.removeCondition(rule.id, condition.id)}
              />
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => rules.addCondition(rule.id)}
          disabled={!rules.canAddRule}
          className={`${ADD_LINK_CLASSES} self-start`}
        >
          + Agregar condición
        </button>
      </div>

      <div className={`${BLOCK_CLASSES} border-t border-border`}>
        <span className={BLOCK_TITLE_CLASSES}>Qué hace</span>

        {rule.effects.length === 0 ? (
          <p className={WARNING_CLASSES}>
            Todavía no hace nada: agregá un cálculo o un valor fijo.
          </p>
        ) : (
          <ul className="flex list-none flex-col gap-2">
            {rule.effects.map((effect) => (
              <RuleEffectRow
                key={effect.id}
                effect={effect}
                knownNames={knownNames}
                onChange={(next) => rules.updateEffect(rule.id, effect.id, next)}
                onRemove={() => rules.removeEffect(rule.id, effect.id)}
              />
            ))}
          </ul>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => rules.addEffect(rule.id, createScriptEffect())}
            className={ADD_LINK_CLASSES}
          >
            + Cálculo
          </button>
          <button
            type="button"
            onClick={() => rules.addEffect(rule.id, createConstantEffect())}
            className={ADD_LINK_CLASSES}
          >
            + Valor fijo
          </button>
        </div>
      </div>
    </li>
  );
}
