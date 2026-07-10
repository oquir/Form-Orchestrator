import { useFormStore } from "../../../../store/formStore";
import type { CanvasField } from "../../../../types/storeTypes";
import { LabeledInput } from "../../../molecules/LabeledInput/LabeledInput";
import { LabeledRangeSlider } from "../../../molecules/LabeledRangeSlider/LabeledRangeSlider";

export function AttributesPanel({ field }: { field: CanvasField }) {
  const updateField = useFormStore((state) => state.updateField);

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
        label={`Columnas (${field.colSpan}/12)`}
        min={1}
        max={12}
        value={field.colSpan}
        onChange={(value) => updateField(field.id, { colSpan: value })}
      />
    </div>
  );
}
