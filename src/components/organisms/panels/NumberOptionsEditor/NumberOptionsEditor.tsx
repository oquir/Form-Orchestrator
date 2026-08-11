import { useFormStore } from "../../../../store/formStore";
import { ToggleSwitch } from "../../../atoms/ToggleSwitch/ToggleSwitch";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import type { NumberOptionsEditorProps } from "./NumberOptionsEditor.types";

export function NumberOptionsEditor({ field }: NumberOptionsEditorProps) {
  const setFieldRounding = useFormStore((state) => state.setFieldRounding);

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
    </PanelSection>
  );
}
