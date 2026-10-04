import { DATE_FORMATS } from "../../../../constants/dateFormats";
import { includesTime, isDateRangeField } from "../../../../lib/fieldDate/fieldDate";
import { useFormStore } from "../../../../store/formStore";
import type { DateFormatId } from "../../../../types/fieldDate";
import { InfoHint } from "../../../atoms/InfoHint/InfoHint";
import { ToggleSwitch } from "../../../atoms/ToggleSwitch/ToggleSwitch";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import {
  DATE_DESCRIPTION,
  FORMAT_DESCRIPTION,
  FORMAT_SELECT_CLASSES,
  MODE_CHOICES,
  MODE_ITEM_ACTIVE_CLASSES,
  MODE_ITEM_BASE_CLASSES,
  MODE_ITEM_INACTIVE_CLASSES,
  MODE_TRACK_CLASSES,
  OPTION_CONTROL_CLASSES,
  OPTION_ROW_CLASSES,
  RANGE_DESCRIPTION,
  TIME_DESCRIPTION,
} from "./DateOptionsEditor.constants";
import type { DateOptionsEditorProps } from "./DateOptionsEditor.types";
import { formatExample } from "./DateOptionsEditor.utils";

export function DateOptionsEditor({ field }: DateOptionsEditorProps) {
  const setFieldDateRange = useFormStore((state) => state.setFieldDateRange);
  const setFieldIncludesTime = useFormStore((state) => state.setFieldIncludesTime);
  const setFieldDateFormat = useFormStore((state) => state.setFieldDateFormat);
  const isRange: boolean = isDateRangeField(field);

  return (
    <PanelSection title="Fecha" description={DATE_DESCRIPTION}>
      <fieldset aria-label="Qué elige el usuario" className={MODE_TRACK_CLASSES}>
        {MODE_CHOICES.map((choice) => (
          <button
            key={choice.label}
            type="button"
            aria-pressed={isRange === choice.range}
            onClick={() => setFieldDateRange(field.id, choice.range)}
            className={`${MODE_ITEM_BASE_CLASSES} ${
              isRange === choice.range ? MODE_ITEM_ACTIVE_CLASSES : MODE_ITEM_INACTIVE_CLASSES
            }`}
          >
            {choice.label}
          </button>
        ))}
      </fieldset>

      {isRange && <p className="text-[10px] text-fg-subtle">{RANGE_DESCRIPTION}</p>}

      <div className={OPTION_ROW_CLASSES}>
        <span className="text-sm text-fg">Incluir hora</span>
        <div className={OPTION_CONTROL_CLASSES}>
          <ToggleSwitch
            checked={includesTime(field)}
            onChange={(checked) => setFieldIncludesTime(field.id, checked)}
            label="Pedir también la hora además de la fecha"
          />
          <InfoHint text={TIME_DESCRIPTION} label="Ayuda sobre Incluir hora" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className={OPTION_ROW_CLASSES}>
          <label htmlFor="field-date-format" className="text-sm text-fg">
            Formato
          </label>
          <div className={OPTION_CONTROL_CLASSES}>
            <select
              id="field-date-format"
              value={field.dateFormat ?? ""}
              onChange={(event) =>
                setFieldDateFormat(
                  field.id,
                  event.target.value === "" ? null : (event.target.value as DateFormatId),
                )
              }
              className={FORMAT_SELECT_CLASSES}
            >
              <option value="">Del navegador</option>
              {DATE_FORMATS.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                </option>
              ))}
            </select>
            <InfoHint text={FORMAT_DESCRIPTION} label="Ayuda sobre Formato" />
          </div>
        </div>
        <p className="text-[10px] text-fg-subtle">{formatExample(field)}</p>
      </div>
    </PanelSection>
  );
}
