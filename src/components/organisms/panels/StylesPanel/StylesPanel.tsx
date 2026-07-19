import { useFormStore } from "../../../../store/formStore";
import type { CanvasField, FieldStyles } from "../../../../types/storeTypes";
import { TwoColumnFieldGroup } from "../../../atoms/TwoColumnFieldGroup/TwoColumnFieldGroup";
import { ColorPickerField } from "../../../molecules/ColorPickerField/ColorPickerField";
import { LabeledInput } from "../../../molecules/LabeledInput/LabeledInput";

export function StylesPanel({ field }: { field: CanvasField }) {
  const updateFieldStyles = useFormStore((state) => state.updateFieldStyles);
  const s: FieldStyles = field.styles;

  return (
    <div className="flex flex-col gap-4">
      <LabeledInput
        id="custom-classes"
        label="Clases CSS (Tailwind)"
        value={s.customClasses ?? ""}
        onChange={(event) => updateFieldStyles(field.id, { customClasses: event.target.value })}
        placeholder="font-bold text-right"
        className="font-mono"
      />

      <TwoColumnFieldGroup legend="Márgenes">
        <LabeledInput
          id="margin-top"
          label="Margen superior"
          value={s.marginTop ?? ""}
          onChange={(event) => updateFieldStyles(field.id, { marginTop: event.target.value })}
          placeholder="10px"
        />
        <LabeledInput
          id="margin-bottom"
          label="Margen inferior"
          value={s.marginBottom ?? ""}
          onChange={(event) => updateFieldStyles(field.id, { marginBottom: event.target.value })}
          placeholder="10px"
        />
      </TwoColumnFieldGroup>

      <TwoColumnFieldGroup legend="Colores">
        <ColorPickerField
          id="background-color"
          label="Color de fondo"
          value={s.backgroundColor ?? ""}
          defaultColor="#ffffff"
          placeholder="#f3f4f6"
          onChange={(value) => updateFieldStyles(field.id, { backgroundColor: value })}
        />
        <ColorPickerField
          id="text-color"
          label="Color de texto"
          value={s.textColor ?? ""}
          defaultColor="#0f172a"
          placeholder="#0f172a"
          onChange={(value) => updateFieldStyles(field.id, { textColor: value })}
        />
      </TwoColumnFieldGroup>
    </div>
  );
}
