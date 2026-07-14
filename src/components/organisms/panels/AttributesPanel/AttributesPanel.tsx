import { findRowContainingField, useFormStore } from "../../../../store/formStore";
import type { CanvasField } from "../../../../types/storeTypes";
import { LabeledInput } from "../../../molecules/LabeledInput/LabeledInput";
import { LabeledRangeSlider } from "../../../molecules/LabeledRangeSlider/LabeledRangeSlider";
import { FileOptionsEditor } from "../FileOptionsEditor/FileOptionsEditor";
import { ToggleGroupOptionsEditor } from "../ToggleGroupOptionsEditor/ToggleGroupOptionsEditor";

export function AttributesPanel({ field }: { field: CanvasField }) {
  const updateField = useFormStore((state) => state.updateField);
  const rowColumns = useFormStore(
    (state) => findRowContainingField(state, field.id)?.columns ?? 16,
  );

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
        label={`Columnas (${field.colSpan}/${rowColumns})`}
        min={1}
        max={rowColumns}
        value={field.colSpan}
        onChange={(value) => updateField(field.id, { colSpan: value })}
      />

      {field.type === "toggle_group" && <ToggleGroupOptionsEditor field={field} />}
      {field.type === "file" && <FileOptionsEditor field={field} />}
    </div>
  );
}
