import { useFormStore } from "../../../../store/formStore";
import type { CanvasField, FieldStyles } from "../../../../types/field";
import { Input } from "../../../atoms/Input/Input";
import { TwoColumnFieldGroup } from "../../../atoms/TwoColumnFieldGroup/TwoColumnFieldGroup";
import { ColorPickerField } from "../../../molecules/ColorPickerField/ColorPickerField";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { PxInput } from "../../../molecules/PxInput/PxInput";

export function StylesPanel({ field }: { field: CanvasField }) {
  const updateFieldStyles = useFormStore((state) => state.updateFieldStyles);
  const s: FieldStyles = field.styles;

  return (
    <div className="flex flex-col gap-3">
      <PanelSection title="Clases CSS (Tailwind)">
        <Input
          id="custom-classes"
          aria-label="Clases CSS de Tailwind"
          value={s.customClasses ?? ""}
          onChange={(event) => updateFieldStyles(field.id, { customClasses: event.target.value })}
          placeholder="font-bold text-right"
          spellCheck={false}
          tone="code"
        />
      </PanelSection>

      <PanelSection title="Márgenes">
        <TwoColumnFieldGroup>
          <PxInput
            id="margin-top"
            label="Superior"
            value={s.marginTop ?? ""}
            onChange={(value) => updateFieldStyles(field.id, { marginTop: value })}
          />
          <PxInput
            id="margin-bottom"
            label="Inferior"
            value={s.marginBottom ?? ""}
            onChange={(value) => updateFieldStyles(field.id, { marginBottom: value })}
          />
        </TwoColumnFieldGroup>
      </PanelSection>

      <PanelSection title="Colores">
        <TwoColumnFieldGroup>
          <ColorPickerField
            id="background-color"
            label="Fondo"
            value={s.backgroundColor ?? ""}
            defaultColor="#ffffff"
            placeholder="#F3F4F6"
            onChange={(value) => updateFieldStyles(field.id, { backgroundColor: value })}
          />
          <ColorPickerField
            id="text-color"
            label="Texto"
            value={s.textColor ?? ""}
            defaultColor="#0f172a"
            placeholder="#0F172A"
            onChange={(value) => updateFieldStyles(field.id, { textColor: value })}
          />
        </TwoColumnFieldGroup>
      </PanelSection>
    </div>
  );
}
