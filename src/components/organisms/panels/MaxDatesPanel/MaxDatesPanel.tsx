import { useState } from "react";
import { conFechaAnual } from "../../../../lib/maxDates/maxDates";
import { maxDatesEnUso, usesCustomMaxDates } from "../../../../lib/maxDatesBank/maxDatesBank";
import { useFormStore } from "../../../../store/formStore";
import type { FechasMaximasPresentacion } from "../../../../types/maxDates";
import { BinaryChoiceToggle } from "../../../molecules/BinaryChoiceToggle/BinaryChoiceToggle";
import { MaxDatesDeclaracionSection } from "../../../molecules/MaxDatesDeclaracionSection/MaxDatesDeclaracionSection";
import { MaxDatesPasteForm } from "../../../molecules/MaxDatesPasteForm/MaxDatesPasteForm";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import {
  ACTION_CLASSES,
  BADGE_EMPTY_CLASSES,
  BADGE_LOADED_CLASSES,
  DECLARACIONES,
  HINT_CLASSES,
  INPUT_CLASSES,
} from "./MaxDatesPanel.constants";

export function MaxDatesPanel() {
  const stored = useFormStore((state) => state.maxDates);
  const setMaxDates = useFormStore((state) => state.setMaxDates);
  const setMaxDatesSource = useFormStore((state) => state.setMaxDatesSource);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const anioActual: number = new Date().getFullYear();
  const fechas: FechasMaximasPresentacion = maxDatesEnUso(stored, anioActual);
  const isCustom: boolean = usesCustomMaxDates(stored);

  // Editar cualquier cosa saca una copia propia. La tabla generada se recalcula con el reloj -- en
  // enero aparece el ano nuevo sola -- asi que si aceptara cambios los perderia sin avisar.
  function edit(next: FechasMaximasPresentacion): void {
    setMaxDates(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className={HINT_CLASSES}>
        Las fechas máximas de presentación con las que el simulador prueba. Tu app las recibe de su
        propio endpoint, así que{" "}
        <strong className="font-semibold">no viajan en el JSON exportado</strong> ni dependen del
        borrador. Por defecto se generan los últimos {fechas.ica.length} años gravables de ICA
        venciendo el 31 de marzo del año siguiente; cualquier cambio guarda una copia tuya y deja de
        seguir esa plantilla.
      </p>

      <PanelSection
        title="Tabla en uso"
        aside={
          <span className={isCustom ? BADGE_LOADED_CLASSES : BADGE_EMPTY_CLASSES}>
            {isCustom ? "Cargada" : "Generada"}
          </span>
        }
      >
        <label className="flex flex-col gap-1">
          <span className={HINT_CLASSES}>Municipio</span>
          <input
            value={String(fechas.municipioId)}
            onChange={(event) => edit({ ...fechas, municipioId: event.target.value })}
            placeholder="Id del municipio"
            className={INPUT_CLASSES}
          />
        </label>

        {stored.custom !== null && (
          <BinaryChoiceToggle
            value={isCustom}
            onChange={(next) => setMaxDatesSource(next ? "custom" : "default")}
            yesLabel="Cargada"
            noLabel="Generada"
          />
        )}

        <div className="flex items-center justify-between gap-2">
          <p className={HINT_CLASSES}>
            {isCustom ? "Usando tu tabla" : "Usando la tabla generada"}
          </p>
          <button type="button" onClick={() => setIsOpen(!isOpen)} className={ACTION_CLASSES}>
            {isOpen ? "Cerrar" : "Pegar del endpoint"}
          </button>
        </div>

        {isOpen && <MaxDatesPasteForm onLoad={setMaxDates} onClose={() => setIsOpen(false)} />}
      </PanelSection>

      {DECLARACIONES.map((declaracion) => (
        <MaxDatesDeclaracionSection
          key={declaracion.kind}
          kind={declaracion.kind}
          label={declaracion.label}
          reglas={fechas[declaracion.kind]}
          onEditFecha={(kind, anio, fecha) => edit(conFechaAnual(fechas, kind, anio, fecha))}
        />
      ))}
    </div>
  );
}
