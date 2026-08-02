import { TOOLTIP_POSITIONS } from "../../../../constants/fieldTooltip";
import { useFormStore } from "../../../../store/formStore";
import type { FieldTooltip } from "../../../../types/field";
import { Checkbox } from "../../../atoms/Checkbox/Checkbox";
import { LabeledInput } from "../../../molecules/LabeledInput/LabeledInput";
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
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-fg">Tooltip de ayuda</p>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Checkbox renderiza un <input type="checkbox"> anidado */}
        <label className="flex items-center gap-1.5 text-[11px] text-fg-muted">
          <Checkbox
            checked={tooltip !== undefined}
            onChange={(event) => updateFieldTooltip(field.id, event.target.checked ? {} : null)}
            className="accent-orange-500"
          />
          Activar
        </label>
      </div>

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

          <LabeledInput
            id="tooltip-classes"
            label="Clases CSS (Tailwind)"
            value={tooltip.customClasses ?? ""}
            onChange={(event) =>
              updateFieldTooltip(field.id, { customClasses: event.target.value })
            }
            placeholder="bg-slate-800 text-white"
            className="font-mono"
          />
        </>
      )}
    </div>
  );
}
