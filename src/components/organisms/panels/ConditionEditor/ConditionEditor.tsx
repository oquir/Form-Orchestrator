import { useFormStore } from "../../../../store/formStore";
import type { CanvasField, EnableCondition, EnableOperator } from "../../../../types/storeTypes";
import { OPERATOR_LABELS, OPERATORS_WITHOUT_VALUE } from "./ConditionEditor.constants";
import type { ConditionEditorProps } from "./ConditionEditor.types";

function operatorsForFieldType(type: string): EnableOperator[] {
  switch (type) {
    case "checkbox":
      return ["isTruthy", "isFalsy"];
    case "number":
    case "calculated":
      return ["equals", "notEquals", "greaterThan", "lessThan", "isEmpty", "isNotEmpty"];
    case "select":
    case "toggle_group":
      return ["equals", "notEquals", "isEmpty", "isNotEmpty"];
    case "file":
      return ["isEmpty", "isNotEmpty"];
    default:
      return ["equals", "notEquals", "isEmpty", "isNotEmpty"];
  }
}

function wouldCreateCycle(
  currentFieldId: string,
  targetFieldId: string,
  allFields: CanvasField[],
): boolean {
  const byId = new Map(allFields.map((f) => [f.id, f]));
  const visited = new Set<string>();
  const stack = [targetFieldId];
  while (stack.length > 0) {
    const id = stack.pop() as string;
    if (id === currentFieldId) return true;
    if (visited.has(id)) continue;
    visited.add(id);
    const next = byId.get(id)?.enableWhen?.fieldId;
    if (next) stack.push(next);
  }
  return false;
}

export function ConditionEditor({ field, otherFields }: ConditionEditorProps) {
  const setFieldEnableWhen = useFormStore((state) => state.setFieldEnableWhen);
  const condition = field.enableWhen;
  const observed = condition ? otherFields.find((f) => f.id === condition.fieldId) : null;
  const observedIsDead = Boolean(condition && !observed);
  const availableOperators = observed
    ? operatorsForFieldType(observed.type)
    : (["equals", "notEquals", "isEmpty", "isNotEmpty"] as EnableOperator[]);
  const needsValue = condition && !OPERATORS_WITHOUT_VALUE.includes(condition.operator);

  function updateCondition(next: Partial<EnableCondition>) {
    if (!condition) return;
    setFieldEnableWhen(field.id, { ...condition, ...next });
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-600 dark:text-neutral-300">
          Habilitación condicional
        </span>
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-neutral-400">
          <input
            type="checkbox"
            checked={Boolean(condition)}
            onChange={(event) => {
              if (event.target.checked) {
                const firstCandidate = otherFields[0];
                if (!firstCandidate) return;
                const ops = operatorsForFieldType(firstCandidate.type);
                setFieldEnableWhen(field.id, {
                  fieldId: firstCandidate.id,
                  operator: ops[0],
                  value: OPERATORS_WITHOUT_VALUE.includes(ops[0]) ? undefined : "",
                });
              } else {
                setFieldEnableWhen(field.id, null);
              }
            }}
            disabled={otherFields.length === 0}
            className="accent-orange-500"
          />
          Activar
        </label>
      </div>

      {otherFields.length === 0 && !condition && (
        <p className="text-[11px] text-slate-400 dark:text-neutral-500">
          Agregá otros campos al lienzo para poder condicionar este.
        </p>
      )}

      {condition && (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
              Se habilita cuando el campo…
            </span>
            <select
              value={condition.fieldId}
              onChange={(event) => {
                const nextField = otherFields.find((f) => f.id === event.target.value);
                if (!nextField) return;
                if (wouldCreateCycle(field.id, nextField.id, otherFields)) {
                  window.alert("Esa condición generaría un ciclo entre campos.");
                  return;
                }
                const ops = operatorsForFieldType(nextField.type);
                setFieldEnableWhen(field.id, {
                  fieldId: nextField.id,
                  operator: ops[0],
                  value: OPERATORS_WITHOUT_VALUE.includes(ops[0]) ? undefined : "",
                });
              }}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-orange-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              {observedIsDead && condition && (
                <option value={condition.fieldId}>(Campo eliminado — reasignar)</option>
              )}
              {otherFields.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.label} ({candidate.type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">…y el valor</span>
            <select
              value={condition.operator}
              onChange={(event) => {
                const nextOp = event.target.value as EnableOperator;
                updateCondition({
                  operator: nextOp,
                  value: OPERATORS_WITHOUT_VALUE.includes(nextOp) ? undefined : condition.value,
                });
              }}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-orange-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              {availableOperators.map((op) => (
                <option key={op} value={op}>
                  {OPERATOR_LABELS[op]}
                </option>
              ))}
            </select>
          </div>

          {needsValue && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-500 dark:text-neutral-400">Valor</span>
              {observed?.options && observed.options.length > 0 ? (
                <select
                  value={String(condition.value ?? "")}
                  onChange={(event) => updateCondition({ value: event.target.value })}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-orange-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  <option value="">— Elegir —</option>
                  {observed.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : observed?.type === "number" || observed?.type === "calculated" ? (
                <input
                  type="number"
                  value={condition.value === undefined ? "" : String(condition.value)}
                  onChange={(event) => {
                    const parsed = Number.parseFloat(event.target.value);
                    updateCondition({ value: Number.isNaN(parsed) ? "" : parsed });
                  }}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-orange-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                />
              ) : (
                <input
                  type="text"
                  value={condition.value === undefined ? "" : String(condition.value)}
                  onChange={(event) => updateCondition({ value: event.target.value })}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-orange-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                />
              )}
            </div>
          )}

          {observedIsDead && (
            <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
              El campo referenciado ya no existe. Reasigná o desactivá la condición.
            </p>
          )}
        </>
      )}
    </div>
  );
}
