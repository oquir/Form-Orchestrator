import { allowsNegative } from "../../../../lib/fieldSign/fieldSign";
import { useFormStore } from "../../../../store/formStore";
import { ToggleSwitch } from "../../../atoms/ToggleSwitch/ToggleSwitch";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { DECIMAL_CHOICES } from "./NumberOptionsEditor.constants";
import type { NumberOptionsEditorProps } from "./NumberOptionsEditor.types";

export function NumberOptionsEditor({ field }: NumberOptionsEditorProps) {
  const setFieldRounding = useFormStore((state) => state.setFieldRounding);
  const setFieldFormatted = useFormStore((state) => state.setFieldFormatted);
  const setFieldAllowsNegative = useFormStore((state) => state.setFieldAllowsNegative);
  const setFieldDecimals = useFormStore((state) => state.setFieldDecimals);

  return (
    <PanelSection title="Número">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-fg">Redondear al millar</span>
        <ToggleSwitch
          checked={Boolean(field.rounding)}
          onChange={(checked) => setFieldRounding(field.id, checked)}
          label="Aproximar el valor al múltiplo de mil más cercano"
        />
      </div>
      <p className="text-[10px] text-fg-subtle">
        Aproxima al múltiplo de mil más cercano: 499 baja a 0 y 500 sube a 1.000. Cambia el valor,
        no solo cómo se ve, así que es el número redondeado el que se guarda y el que viaja en el
        payload. Si lo escribe el usuario se aplica al salir del campo; si lo produce un script o
        una regla, apenas se calcula.
      </p>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-fg">Separar miles y decimales</span>
        <ToggleSwitch
          checked={Boolean(field.formatted)}
          onChange={(checked) => setFieldFormatted(field.id, checked)}
          label="Mostrar el valor con punto de miles y coma decimal"
        />
      </div>
      <p className="text-[10px] text-fg-subtle">
        Muestra 1.000 en vez de 1000 y 1,5 en vez de 1.5, al salir del campo. Esto sí es solo
        presentación: el valor guardado y el que viaja en el payload siguen siendo el número. Al
        volver a entrar al campo se ve sin puntos, para poder editarlo.
      </p>

      <div className="flex items-center justify-between gap-2">
        <label htmlFor="field-decimals" className="text-sm text-fg">
          Decimales
        </label>
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
      </div>
      <p className="text-[10px] text-fg-subtle">
        Con 0 la coma no se puede escribir y el valor se redondea a entero. Con 1 una tarifa de 6 se
        muestra 6,0, para que la columna quede pareja. Rellenar con ceros es solo presentación, pero
        recortar decimales sí cambia el valor guardado.
      </p>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-fg">Admite negativos</span>
        <ToggleSwitch
          checked={allowsNegative(field)}
          onChange={(checked) => setFieldAllowsNegative(field.id, checked)}
          label="Permitir valores negativos en este campo"
        />
      </div>
      <p className="text-[10px] text-fg-subtle">
        Apagado, no deja escribir el signo menos y recorta a 0 cualquier resultado negativo de un
        script o una regla. Recorta el valor, no solo lo que se ve: un total a pagar de −1.000.000
        se guarda como 0 y así lo lee el campo de abajo.
      </p>
    </PanelSection>
  );
}
