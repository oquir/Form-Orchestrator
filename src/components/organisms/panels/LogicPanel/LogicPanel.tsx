import { getAllFields, useFormStore } from "../../../../store/formStore";
import type { CanvasField } from "../../../../types/storeTypes";
import { DependencyCheckboxRow } from "../../../molecules/DependencyCheckboxRow/DependencyCheckboxRow";
import { LabeledTextarea } from "../../../molecules/LabeledTextarea/LabeledTextarea";
import { ConditionEditor } from "../ConditionEditor/ConditionEditor";

export function LogicPanel({ field }: { field: CanvasField }) {
  const formSteps = useFormStore((state) => state.formSteps);
  const toggleFieldDependency = useFormStore((state) => state.toggleFieldDependency);
  const updateFieldLogic = useFormStore((state) => state.updateFieldLogic);
  const updateField = useFormStore((state) => state.updateField);

  const allFields = getAllFields(formSteps.flatMap((step) => step.rows));
  const otherFields = allFields.filter((candidate) => candidate.id !== field.id);
  const isAlwaysDisabled = Boolean(field.alwaysDisabled);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-300">
        <input
          type="checkbox"
          checked={isAlwaysDisabled}
          onChange={(event) => updateField(field.id, { alwaysDisabled: event.target.checked })}
          className="mt-0.5 accent-orange-500"
        />
        <span className="flex flex-col gap-0.5">
          <span className="font-medium">Siempre deshabilitado (solo lectura)</span>
          <span className="text-[11px] text-slate-400 dark:text-neutral-500">
            El campo se muestra pero el usuario no puede editarlo. Útil para valores calculados o
            informativos.
          </span>
        </span>
      </label>

      {!isAlwaysDisabled && <ConditionEditor field={field} otherFields={otherFields} />}

      <section aria-labelledby="logic-dependencies-heading">
        <h3
          id="logic-dependencies-heading"
          className="mb-1 text-xs font-medium text-slate-500 dark:text-neutral-400"
        >
          Depende de (para el script)
        </h3>
        <p className="mb-2 text-xs text-slate-400 dark:text-neutral-500">
          Marca campos cuyo valor lee el script TS de abajo. La condición de habilitación se maneja
          arriba, no acá.
        </p>
        {otherFields.length === 0 ? (
          <p className="text-xs text-slate-300 dark:text-neutral-600">
            No hay otros campos en el lienzo todavía.
          </p>
        ) : (
          <ul className="flex list-none flex-col gap-1.5">
            {otherFields.map((candidate) => (
              <li key={candidate.id}>
                <DependencyCheckboxRow
                  label={candidate.label}
                  type={candidate.type}
                  checked={field.logic.dependencies.includes(candidate.id)}
                  onChange={() => toggleFieldDependency(field.id, candidate.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <LabeledTextarea
        id="logic-typescript"
        label="Script TypeScript"
        variant="code"
        rows={8}
        value={field.logic.typeScript}
        onChange={(event) => updateFieldLogic(field.id, { typeScript: event.target.value })}
        placeholder={
          "onChange(val => {\n  if (val > getFieldValue('otro_campo')) {\n    alert('No puede ser mayor');\n  }\n});"
        }
        spellCheck={false}
      />
    </div>
  );
}
