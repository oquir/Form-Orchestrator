import type { CanvasField } from "../../../store/formStore";
import { useFormStore } from "../../../store/formStore";
import { ColorPickerField } from "../../molecules/ColorPickerField";
import { LabeledInput } from "../../molecules/LabeledInput";
import { TwoColumnFieldGroup } from "../../molecules/TwoColumnFieldGroup";

export function StylesPanel({ field }: { field: CanvasField }) {
  const updateFieldStyles = useFormStore((state) => state.updateFieldStyles);
  const s = field.styles;

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

      <TwoColumnFieldGroup>
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

      <TwoColumnFieldGroup>
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
