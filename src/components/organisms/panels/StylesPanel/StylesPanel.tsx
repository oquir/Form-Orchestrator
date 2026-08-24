import { useFormStore } from "../../../../store/formStore";
import type { CanvasField, FieldStyles } from "../../../../types/field";
import { Textarea } from "../../../atoms/TextArea/Textarea";
import { TwoColumnFieldGroup } from "../../../atoms/TwoColumnFieldGroup/TwoColumnFieldGroup";
import { ColorPickerField } from "../../../molecules/ColorPickerField/ColorPickerField";
import { CssValidationHint } from "../../../molecules/CssValidationHint/CssValidationHint";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { PxInput } from "../../../molecules/PxInput/PxInput";

export function StylesPanel({ field }: { field: CanvasField }) {
  const updateFieldStyles = useFormStore((state) => state.updateFieldStyles);
  const s: FieldStyles = field.styles;

  return (
    <div className="flex flex-col gap-3">
      <PanelSection title="CSS personalizado">
        <Textarea
          id="custom-css"
          aria-label="CSS personalizado del campo"
          value={s.customCss ?? ""}
          onChange={(event) => updateFieldStyles(field.id, { customCss: event.target.value })}
          placeholder={"font-weight: 700;\ntext-align: right;"}
          spellCheck={false}
          rows={3}
          variant="code"
        />
        <CssValidationHint text={s.customCss ?? ""} />
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
