import { Xmark } from "reicon-react";
import { OPERATOR_LABELS } from "../../../constants/conditions";
import {
  operatorNeedsValue,
  operatorsForFieldType,
} from "../../../lib/fieldCondition/fieldCondition";
import type { CanvasField } from "../../../types/field";
import { IconButton } from "../../atoms/IconButton/IconButton";
import { ConditionFieldSelect } from "../ConditionFieldSelect/ConditionFieldSelect";
import { ConditionOperatorSelect } from "../ConditionOperatorSelect/ConditionOperatorSelect";
import { ConditionValueInput } from "../ConditionValueInput/ConditionValueInput";
import { PARTS_CLASSES, REMOVE_BUTTON_CLASSES, ROW_CLASSES } from "./RuleConditionRow.constants";
import type { RuleConditionRowProps } from "./RuleConditionRow.types";

export function RuleConditionRow({
  condition,
  candidates,
  onFieldChange,
  onUpdate,
  onRemove,
}: RuleConditionRowProps) {
  const observed: CanvasField | undefined = candidates.find(
    (candidate) => candidate.id === condition.fieldId,
  );

  return (
    <li className={ROW_CLASSES}>
      <div className={PARTS_CLASSES}>
        <div className="min-w-0">
          <ConditionFieldSelect
            label="Cuando el campo…"
            condition={condition}
            otherFields={candidates}
            observedIsDead={observed === undefined}
            onChange={onFieldChange}
          />
        </div>

        <div className="min-w-0">
          <ConditionOperatorSelect
            operator={condition.operator}
            availableOperators={operatorsForFieldType(observed?.type ?? "text")}
            operatorLabels={OPERATOR_LABELS}
            onChange={(operator) =>
              onUpdate({
                operator,
                value: operatorNeedsValue(operator) ? condition.value : undefined,
              })
            }
          />
        </div>

        {operatorNeedsValue(condition.operator) && (
          <div className="min-w-0">
            <ConditionValueInput
              condition={condition}
              observedField={observed}
              onChange={(value) => onUpdate({ value })}
            />
          </div>
        )}
      </div>

      <IconButton
        onClick={onRemove}
        aria-label="Quitar condición"
        title="Quitar condición"
        className={REMOVE_BUTTON_CLASSES}
      >
        <Xmark size={12} weight="Filled" />
      </IconButton>
    </li>
  );
}
