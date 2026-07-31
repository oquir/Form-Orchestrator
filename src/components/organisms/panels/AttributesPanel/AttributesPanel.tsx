import { GRID_BASE_COLUMNS } from "../../../../constants/grid";
import {
  findLabelFor,
  isPresentationalField,
  labelTargetCandidates,
} from "../../../../lib/fieldKind/fieldKind";
import { allowsManualOptions, isOptionBasedField } from "../../../../lib/fieldOptions/fieldOptions";
import { getFreeRuns, getMaxSpanAt } from "../../../../lib/rowLayout/rowLayout";
import {
  findRowContainingField,
  getActiveRows,
  getAllFields,
  useFormStore,
} from "../../../../store/formStore";
import type { CanvasField } from "../../../../types/field";
import { FieldNameInput } from "../../../molecules/FieldNameInput/FieldNameInput";
import { LabeledInput } from "../../../molecules/LabeledInput/LabeledInput";
import { LabeledRangeSlider } from "../../../molecules/LabeledRangeSlider/LabeledRangeSlider";
import { LabelTargetSelect } from "../../../molecules/LabelTargetSelect/LabelTargetSelect";
import { FieldOptionsEditor } from "../FieldOptionsEditor/FieldOptionsEditor";
import { FileOptionsEditor } from "../FileOptionsEditor/FileOptionsEditor";

export function AttributesPanel({ field }: { field: CanvasField }) {
  const updateField = useFormStore((state) => state.updateField);
  const setSidebarTab = useFormStore((state) => state.setSidebarTab);
  const setFieldLabelFor = useFormStore((state) => state.setFieldLabelFor);
  const activeRows = useFormStore(getActiveRows);
  const row = useFormStore((state) => findRowContainingField(state, field.id));
  const rowColumns = row?.columns ?? GRID_BASE_COLUMNS;
  const maxSpan = row
    ? getMaxSpanAt(getFreeRuns(row.fields, row.columns, field.id), field.colStart)
    : rowColumns;
  const isOptionBased: boolean = isOptionBasedField(field.type);
  const canEditOptions: boolean = allowsManualOptions(field);
  const isPresentational: boolean = isPresentationalField(field.type);
  const linkedLabel = findLabelFor(getAllFields(activeRows), field.id);

  return (
    <div className="flex flex-col gap-4">
      <LabeledInput id="field-type" label="Tipo" value={field.type} disabled />

      <div className="flex flex-col gap-1">
        <LabeledInput
          id="field-label"
          label={isPresentational ? "Texto" : "Etiqueta"}
          value={linkedLabel ? linkedLabel.label : field.label}
          disabled={linkedLabel !== null}
          onChange={(event) => updateField(field.id, { label: event.target.value })}
        />
        {linkedLabel && (
          <span className="text-[11px] text-fg-subtle">
            La aporta la etiqueta ligada. Editála seleccionando ese campo en el lienzo.
          </span>
        )}
      </div>

      {isPresentational && (
        <LabelTargetSelect
          value={field.labelFor}
          candidates={labelTargetCandidates(getAllFields(activeRows), field.id)}
          onChange={(targetFieldId) => setFieldLabelFor(field.id, targetFieldId)}
        />
      )}

      <FieldNameInput key={field.id} field={field} />

      <LabeledRangeSlider
        id="field-colspan"
        label={`Columnas (${field.colSpan}/${rowColumns}) · desde col ${field.colStart}`}
        min={1}
        max={maxSpan}
        value={field.colSpan}
        onChange={(value) => updateField(field.id, { colSpan: value })}
      />

      {canEditOptions && <FieldOptionsEditor field={field} />}

      {isOptionBased && !canEditOptions && (
        <div className="flex flex-col items-start gap-2 border-t border-slate-200 pt-4 dark:border-neutral-700">
          <p className="text-sm font-medium text-slate-700 dark:text-neutral-200">Opciones</p>
          <p className="text-xs text-slate-400 dark:text-neutral-500">
            Las carga el aplicativo que recibe el JSON consultando la base de datos según la ruta
            mapeada. Si este campo no sale de un catálogo, marcálo como excluido del payload y vas a
            poder definirlas a mano.
          </p>
          <button
            type="button"
            onClick={() => setSidebarTab("apiMapping")}
            className="text-xs font-medium text-orange-600 hover:cursor-pointer hover:text-orange-500 dark:text-orange-500 dark:hover:text-orange-400"
          >
            Ir a Mapeo API
          </button>
        </div>
      )}

      {field.type === "file" && <FileOptionsEditor field={field} />}
    </div>
  );
}
