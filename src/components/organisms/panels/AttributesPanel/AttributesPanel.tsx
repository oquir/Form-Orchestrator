import { GRID_BASE_COLUMNS } from "../../../../constants/grid";
import { getFreeRuns, getMaxSpanAt } from "../../../../lib/rowLayout/rowLayout";
import { findRowContainingField, useFormStore } from "../../../../store/formStore";
import type { CanvasField } from "../../../../types/storeTypes";
import { LabeledInput } from "../../../molecules/LabeledInput/LabeledInput";
import { LabeledRangeSlider } from "../../../molecules/LabeledRangeSlider/LabeledRangeSlider";
import { FileOptionsEditor } from "../FileOptionsEditor/FileOptionsEditor";
import { RadioGroupOptionsEditor } from "../RadioGroupOptionsEditor/RadioGroupOptionsEditor";
import { ToggleGroupOptionsEditor } from "../ToggleGroupOptionsEditor/ToggleGroupOptionsEditor";

export function AttributesPanel({ field }: { field: CanvasField }) {
  const updateField = useFormStore((state) => state.updateField);
  const row = useFormStore((state) => findRowContainingField(state, field.id));
  const rowColumns = row?.columns ?? GRID_BASE_COLUMNS;
  const maxSpan = row
    ? getMaxSpanAt(getFreeRuns(row.fields, row.columns, field.id), field.colStart)
    : rowColumns;

  return (
    <div className="flex flex-col gap-4">
      <LabeledInput id="field-type" label="Tipo" value={field.type} disabled />

      <LabeledInput
        id="field-label"
        label="Etiqueta"
        value={field.label}
        onChange={(event) => updateField(field.id, { label: event.target.value })}
      />

      <LabeledRangeSlider
        id="field-colspan"
        label={`Columnas (${field.colSpan}/${rowColumns}) · desde col ${field.colStart}`}
        min={1}
        max={maxSpan}
        value={field.colSpan}
        onChange={(value) => updateField(field.id, { colSpan: value })}
      />

      {field.type === "toggle_group" && <ToggleGroupOptionsEditor field={field} />}
      {field.type === "radio_group" && <RadioGroupOptionsEditor field={field} />}
      {field.type === "file" && <FileOptionsEditor field={field} />}
    </div>
  );
}
