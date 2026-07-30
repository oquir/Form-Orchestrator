import { ArrowDown, ArrowUp, Xmark } from "reicon-react";
import { useFieldRules } from "../../../../hooks/useFieldRules/useFieldRules";
import {
  operatorNeedsValue,
  operatorsForFieldType,
} from "../../../../lib/fieldCondition/fieldCondition";
import { createConstantEffect, createFormulaEffect } from "../../../../lib/fieldRule/fieldRule";
import type { CanvasField, FieldRule } from "../../../../types/field";
import { IconButton } from "../../../atoms/IconButton/IconButton";
import { ConditionFieldSelect } from "../../../molecules/ConditionFieldSelect/ConditionFieldSelect";
import { ConditionOperatorSelect } from "../../../molecules/ConditionOperatorSelect/ConditionOperatorSelect";
import { ConditionValueInput } from "../../../molecules/ConditionValueInput/ConditionValueInput";
import { FormulaInput } from "../../../molecules/FormulaInput/FormulaInput";
import { RuleEffectRow } from "../../../molecules/RuleEffectRow/RuleEffectRow";
import { OPERATOR_LABELS } from "../ConditionEditor/ConditionEditor.constants";
import {
  ADD_LINK_CLASSES,
  BASE_FORMULA_HINT,
  MOVE_BUTTON_CLASSES,
  REMOVE_BUTTON_CLASSES,
  RULES_HINT,
  SMALL_SELECT_CLASSES,
} from "./FieldRulesEditor.constants";
import type { FieldRulesEditorProps } from "./FieldRulesEditor.types";

export function FieldRulesEditor({ field, candidates }: FieldRulesEditorProps) {
  const rules = useFieldRules({ field, candidates });

  function renderRule(rule: FieldRule, index: number) {
    return (
      <li
        key={rule.id}
        className="flex flex-col gap-2 rounded-md border border-border bg-surface-sunken p-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-fg-muted">Regla {index + 1}</span>
          <input
            type="text"
            value={rule.label ?? ""}
            onChange={(event) => rules.setRuleLabel(rule.id, event.target.value)}
            placeholder="Nombre (opcional)"
            className="min-w-0 flex-1 rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border"
          />
          <IconButton
            onClick={() => rules.moveRule(rule.id, -1)}
            disabled={index === 0}
            title="Subir"
            className={MOVE_BUTTON_CLASSES}
          >
            <ArrowUp size={12} weight="Filled" />
          </IconButton>
          <IconButton
            onClick={() => rules.moveRule(rule.id, 1)}
            disabled={index === rules.rules.length - 1}
            title="Bajar"
            className={MOVE_BUTTON_CLASSES}
          >
            <ArrowDown size={12} weight="Filled" />
          </IconButton>
          <IconButton
            onClick={() => rules.removeRule(rule.id)}
            title="Eliminar regla"
            className={REMOVE_BUTTON_CLASSES}
          >
            <Xmark size={12} weight="Filled" />
          </IconButton>
        </div>

        <label className="flex items-center gap-2 text-[11px] text-fg-muted">
          Se cumple si
          <select
            value={rule.matchAll ? "todas" : "alguna"}
            onChange={(event) => rules.setRuleMatchAll(rule.id, event.target.value === "todas")}
            className={SMALL_SELECT_CLASSES}
          >
            <option value="todas">todas las condiciones</option>
            <option value="alguna">alguna condición</option>
          </select>
        </label>

        <ul className="flex list-none flex-col gap-2">
          {rule.when.map((condition) => {
            const observed: CanvasField | undefined = candidates.find(
              (candidate) => candidate.id === condition.fieldId,
            );

            return (
              <li
                key={condition.id}
                className="flex items-start gap-2 rounded-md border border-border-subtle bg-surface p-2"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <ConditionFieldSelect
                    label="Cuando el campo…"
                    condition={condition}
                    otherFields={candidates}
                    observedIsDead={observed === undefined}
                    onChange={(fieldId) => rules.setConditionField(rule.id, condition.id, fieldId)}
                  />

                  <ConditionOperatorSelect
                    operator={condition.operator}
                    availableOperators={operatorsForFieldType(observed?.type ?? "text")}
                    operatorLabels={OPERATOR_LABELS}
                    onChange={(operator) =>
                      rules.updateCondition(rule.id, condition.id, {
                        operator,
                        value: operatorNeedsValue(operator) ? condition.value : undefined,
                      })
                    }
                  />

                  {operatorNeedsValue(condition.operator) && (
                    <ConditionValueInput
                      condition={condition}
                      observedField={observed}
                      onChange={(value) => rules.updateCondition(rule.id, condition.id, { value })}
                    />
                  )}
                </div>

                <IconButton
                  onClick={() => rules.removeCondition(rule.id, condition.id)}
                  title="Quitar condición"
                  className={REMOVE_BUTTON_CLASSES}
                >
                  <Xmark size={12} weight="Filled" />
                </IconButton>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => rules.addCondition(rule.id)}
          disabled={!rules.canAddRule}
          className={ADD_LINK_CLASSES}
        >
          + Agregar condición
        </button>

        <ul className="flex list-none flex-col gap-2 border-t border-border-subtle pt-2">
          {rule.effects.map((effect) => (
            <RuleEffectRow
              key={effect.id}
              effect={effect}
              candidates={candidates}
              selfName={field.name}
              onChange={(next) => rules.updateEffect(rule.id, effect.id, next)}
              onRemove={() => rules.removeEffect(rule.id, effect.id)}
            />
          ))}
        </ul>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => rules.addEffect(rule.id, createFormulaEffect())}
            className={ADD_LINK_CLASSES}
          >
            + Fórmula
          </button>
          <button
            type="button"
            onClick={() => rules.addEffect(rule.id, createConstantEffect())}
            className={ADD_LINK_CLASSES}
          >
            + Valor fijo
          </button>
        </div>
      </li>
    );
  }

  return (
    <section
      aria-labelledby="field-rules-heading"
      className="flex flex-col gap-3 border-t border-border pt-4"
    >
      <h3 id="field-rules-heading" className="text-xs font-medium text-fg-muted">
        Cálculo del campo
      </h3>

      <FormulaInput
        id="field-base-formula"
        label="Fórmula base"
        value={rules.formula}
        candidates={candidates}
        selfName={field.name}
        placeholder="ingresos_ordinarios - ingresos_fuera_municipio"
        onChange={rules.setFormula}
      />

      <p className="text-[11px] text-fg-subtle">{BASE_FORMULA_HINT}</p>

      <div className="flex items-center justify-between border-t border-border-subtle pt-3">
        <h4 className="text-xs font-medium text-fg-muted">Reglas condicionales</h4>
        <button
          type="button"
          onClick={rules.addRule}
          disabled={!rules.canAddRule}
          className={ADD_LINK_CLASSES}
        >
          + Agregar regla
        </button>
      </div>

      {rules.rules.length === 0 ? (
        <p className="text-[11px] text-fg-subtle">
          {rules.canAddRule
            ? "Sin reglas. El campo usa siempre la fórmula base."
            : "Agregá otros campos al lienzo para poder condicionar el cálculo de este."}
        </p>
      ) : (
        <>
          <p className="text-[11px] text-fg-subtle">{RULES_HINT}</p>
          <ul className="flex list-none flex-col gap-3">{rules.rules.map(renderRule)}</ul>
        </>
      )}
    </section>
  );
}
