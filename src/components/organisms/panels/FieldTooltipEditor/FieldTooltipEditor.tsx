import { TOOLTIP_POSITIONS } from "../../../../constants/fieldTooltip";
import { useFormStore } from "../../../../store/formStore";
import type { FieldTooltip } from "../../../../types/field";
import { Label } from "../../../atoms/Label/Label";
import { Textarea } from "../../../atoms/TextArea/Textarea";
import { ToggleSwitch } from "../../../atoms/ToggleSwitch/ToggleSwitch";
import { CssValidationHint } from "../../../molecules/CssValidationHint/CssValidationHint";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { RichTextEditor } from "../../../molecules/RichTextEditor/RichTextEditor";
import {
  POSITION_ACTIVE_CLASSES,
  POSITION_BUTTON_CLASSES,
  POSITION_IDLE_CLASSES,
  TOOLTIP_POSITION_OPTIONS,
} from "./FieldTooltipEditor.constants";
import type { FieldTooltipEditorProps } from "./FieldTooltipEditor.types";

export function FieldTooltipEditor({ field }: FieldTooltipEditorProps) {
  const updateFieldTooltip = useFormStore((state) => state.updateFieldTooltip);
  const tooltip: FieldTooltip | undefined = field.tooltip;

  return (
    <PanelSection
      title="Tooltip de ayuda"
      aside={
        <ToggleSwitch
          checked={tooltip !== undefined}
          onChange={(checked) => updateFieldTooltip(field.id, checked ? {} : null)}
          label="Activar el tooltip de ayuda"
        />
      }
    >
      {!tooltip && (
        <p className="text-xs text-fg-subtle">
          Agrega un ícono de información junto a la etiqueta. El contribuyente ve el mensaje al
          pasar el mouse o al tocarlo desde el celular.
        </p>
      )}

      {tooltip && (
        <>
          <RichTextEditor
            key={field.id}
            value={tooltip.content}
            onChange={(content) => updateFieldTooltip(field.id, { content })}
          />

          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-1.5 p-0 text-xs font-medium text-fg-soft">Posición</legend>
            <ul className="grid list-none grid-cols-4 gap-1.5">
              {TOOLTIP_POSITIONS.map((position) => {
                const option = TOOLTIP_POSITION_OPTIONS[position];
                const Icon = option.icon;
                const isActive: boolean = tooltip.position === position;

                return (
                  <li key={position}>
                    <button
                      type="button"
                      onClick={() => updateFieldTooltip(field.id, { position })}
                      title={`Mostrar ${option.label.toLowerCase()} del campo`}
                      className={`${POSITION_BUTTON_CLASSES} ${
                        isActive ? POSITION_ACTIVE_CLASSES : POSITION_IDLE_CLASSES
                      }`}
                    >
                      <Icon size={14} />
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <div className="flex flex-col gap-1">
            <Label htmlFor="tooltip-css">CSS personalizado</Label>
            <Textarea
              id="tooltip-css"
              aria-label="CSS personalizado del tooltip"
              value={tooltip.customCss ?? ""}
              onChange={(event) => updateFieldTooltip(field.id, { customCss: event.target.value })}
              placeholder={"background: #1e293b;\ncolor: #fff;"}
              spellCheck={false}
              rows={3}
              variant="code"
            />
            <CssValidationHint text={tooltip.customCss ?? ""} />
          </div>
        </>
      )}
    </PanelSection>
  );
}
