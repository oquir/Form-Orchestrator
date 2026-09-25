import { allowsNegative } from "../../../../lib/fieldSign/fieldSign";
import { useFormStore } from "../../../../store/formStore";
import { InfoHint } from "../../../atoms/InfoHint/InfoHint";
import { ToggleSwitch } from "../../../atoms/ToggleSwitch/ToggleSwitch";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import {
  DECIMAL_CHOICES,
  DECIMALS_DESCRIPTION,
  FORMATTED_DESCRIPTION,
  NEGATIVE_DESCRIPTION,
  NUMBER_DESCRIPTION,
  OPTION_CONTROL_CLASSES,
  OPTION_ROW_CLASSES,
  ROUNDING_DESCRIPTION,
} from "./NumberOptionsEditor.constants";
import type { NumberOptionsEditorProps } from "./NumberOptionsEditor.types";

export function NumberOptionsEditor({ field }: NumberOptionsEditorProps) {
  const setFieldRounding = useFormStore((state) => state.setFieldRounding);
  const setFieldFormatted = useFormStore((state) => state.setFieldFormatted);
  const setFieldAllowsNegative = useFormStore((state) => state.setFieldAllowsNegative);
  const setFieldDecimals = useFormStore((state) => state.setFieldDecimals);

  return (
    <PanelSection title="Número" description={NUMBER_DESCRIPTION}>
      <div className={OPTION_ROW_CLASSES}>
        <span className="text-sm text-fg">Redondear al millar</span>
        <div className={OPTION_CONTROL_CLASSES}>
          <ToggleSwitch
            checked={Boolean(field.rounding)}
            onChange={(checked) => setFieldRounding(field.id, checked)}
            label="Aproximar el valor al múltiplo de mil más cercano"
          />
          <InfoHint text={ROUNDING_DESCRIPTION} label="Ayuda sobre Redondear al millar" />
        </div>
      </div>

      <div className={OPTION_ROW_CLASSES}>
        <span className="text-sm text-fg">Separar miles y decimales</span>
        <div className={OPTION_CONTROL_CLASSES}>
          <ToggleSwitch
            checked={Boolean(field.formatted)}
            onChange={(checked) => setFieldFormatted(field.id, checked)}
            label="Mostrar el valor con punto de miles y coma decimal"
          />
          <InfoHint text={FORMATTED_DESCRIPTION} label="Ayuda sobre Separar miles y decimales" />
        </div>
      </div>

      <div className={OPTION_ROW_CLASSES}>
        <label htmlFor="field-decimals" className="text-sm text-fg">
          Decimales
        </label>
        <div className={OPTION_CONTROL_CLASSES}>
          <select
            id="field-decimals"
            value={field.decimals ?? ""}
            onChange={(event) =>
              setFieldDecimals(
                field.id,
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
            className="rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border"
          >
            <option value="">Los que traiga</option>
            {DECIMAL_CHOICES.map((choice) => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
          </select>
          <InfoHint text={DECIMALS_DESCRIPTION} label="Ayuda sobre Decimales" />
        </div>
      </div>

      <div className={OPTION_ROW_CLASSES}>
        <span className="text-sm text-fg">Admite negativos</span>
        <div className={OPTION_CONTROL_CLASSES}>
          <ToggleSwitch
            checked={allowsNegative(field)}
            onChange={(checked) => setFieldAllowsNegative(field.id, checked)}
            label="Permitir valores negativos en este campo"
          />
          <InfoHint text={NEGATIVE_DESCRIPTION} label="Ayuda sobre Admite negativos" />
        </div>
      </div>
    </PanelSection>
  );
}
