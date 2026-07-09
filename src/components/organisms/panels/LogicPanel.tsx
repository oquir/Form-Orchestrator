import type { CanvasField } from "../../../store/formStore";
import { getAllFields, useFormStore } from "../../../store/formStore";
import { DependencyCheckboxRow } from "../../molecules/DependencyCheckboxRow";
import { LabeledTextarea } from "../../molecules/LabeledTextarea";

export function LogicPanel({ field }: { field: CanvasField }) {
  const formSteps = useFormStore((state) => state.formSteps);
  const toggleFieldDependency = useFormStore((state) => state.toggleFieldDependency);
  const updateFieldLogic = useFormStore((state) => state.updateFieldLogic);

  const otherFields = getAllFields(formSteps.flatMap((step) => step.rows)).filter(
    (candidate) => candidate.id !== field.id,
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Depende de</h3>
        <p className="mb-2 text-xs text-slate-400 dark:text-slate-500">
          Marca los campos cuyo valor afecta a este campo (ej. mostrarlo solo si X = Y).
        </p>
        {otherFields.length === 0 ? (
          <p className="text-xs text-slate-300 dark:text-slate-600">
            No hay otros campos en el lienzo todavía.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {otherFields.map((candidate) => (
              <DependencyCheckboxRow
                key={candidate.id}
                label={candidate.label}
                type={candidate.type}
                checked={field.logic.dependencies.includes(candidate.id)}
                onChange={() => toggleFieldDependency(field.id, candidate.id)}
              />
            ))}
          </div>
        )}
      </div>

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
