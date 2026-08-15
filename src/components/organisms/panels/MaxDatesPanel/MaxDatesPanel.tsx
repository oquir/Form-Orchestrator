import { useState } from "react";
import { conFechaAnual, fechasEsperadas } from "../../../../lib/maxDates/maxDates";
import {
  maxDatesEnUso,
  parseMaxDatesPaste,
  usesCustomMaxDates,
} from "../../../../lib/maxDatesBank/maxDatesBank";
import { useFormStore } from "../../../../store/formStore";
import type { FechasMaximasPresentacion, MaxDatesParseResult } from "../../../../types/maxDates";
import { Button } from "../../../atoms/Button/Button";
import { BinaryChoiceToggle } from "../../../molecules/BinaryChoiceToggle/BinaryChoiceToggle";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import {
  ACTION_CLASSES,
  BADGE_EMPTY_CLASSES,
  BADGE_LOADED_CLASSES,
  BADGE_PARCIAL_CLASSES,
  DECLARACIONES,
  DIGITO_LABEL,
  ERROR_CLASSES,
  HINT_CLASSES,
  INPUT_CLASSES,
  PASTE_PLACEHOLDER,
  PERIODICIDAD_LABEL,
  TEXTAREA_CLASSES,
} from "./MaxDatesPanel.constants";
import type { AnioRowProps, DeclaracionSectionProps, PasteFormProps } from "./MaxDatesPanel.types";

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

        {isOpen && <PasteForm onLoad={setMaxDates} onClose={() => setIsOpen(false)} />}
      </PanelSection>

      {DECLARACIONES.map((declaracion) => (
        <DeclaracionSection
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

function DeclaracionSection({ kind, label, reglas, onEditFecha }: DeclaracionSectionProps) {
  return (
    <PanelSection
      title={label}
      aside={
        <span className={reglas.length > 0 ? BADGE_LOADED_CLASSES : BADGE_EMPTY_CLASSES}>
          {reglas.length > 0 ? `${reglas.length} años` : "Sin cargar"}
        </span>
      }
    >
      {reglas.length === 0 ? (
        <p className={HINT_CLASSES}>
          Sin fechas. Sus vencimientos dependen del municipio, así que no se inventan: pegá la
          respuesta del endpoint arriba.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {reglas.map((regla) => (
            <AnioRow
              key={regla.anio}
              regla={regla}
              onEditFecha={(fecha) => onEditFecha(kind, regla.anio, fecha)}
            />
          ))}
        </ul>
      )}
    </PanelSection>
  );
}

function AnioRow({ regla, onEditFecha }: AnioRowProps) {
  const esperadas: number = fechasEsperadas(regla);
  const completo: boolean = regla.fechas.length === esperadas;
  // Solo el caso simple se teclea. Los demas van de 6 a 120 fechas, y eso no lo carga nadie a mano.
  const editable: boolean = regla.periodicidad === "anual" && regla.tipoDigito === "ninguno";

  return (
    <li className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-medium tabular-nums text-fg">{regla.anio}</span>
        <span className={`${HINT_CLASSES} truncate`}>
          {PERIODICIDAD_LABEL[regla.periodicidad]} · {DIGITO_LABEL[regla.tipoDigito]}
        </span>
      </div>

      {editable ? (
        <input
          value={regla.fechas[0]?.fecha ?? ""}
          onChange={(event) => onEditFecha(event.target.value)}
          placeholder="YYYY/MM/DD"
          aria-label={`Fecha máxima del año ${regla.anio}`}
          className={`${INPUT_CLASSES} w-32 shrink-0 text-right tabular-nums`}
        />
      ) : (
        <span className={completo ? BADGE_LOADED_CLASSES : BADGE_PARCIAL_CLASSES}>
          {regla.fechas.length}/{esperadas} fechas
        </span>
      )}
    </li>
  );
}

function PasteForm({ onLoad, onClose }: PasteFormProps) {
  const [raw, setRaw] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  function load(): void {
    const result: MaxDatesParseResult = parseMaxDatesPaste(raw);

    if (result.error || !result.fechas) {
      setError(result.error);
      return;
    }

    onLoad(result.fechas);
    setError(null);
    setRaw("");
    onClose();
  }

  return (
    <>
      <textarea
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        placeholder={PASTE_PLACEHOLDER}
        aria-label="Respuesta del endpoint de fechas máximas"
        className={TEXTAREA_CLASSES}
      />

      <p className={HINT_CLASSES}>
        Se pega el objeto completo, tal como lo devuelve el endpoint: no hay que nombrar columnas
        porque ya viene con la forma que se necesita. Si viene envuelto en{" "}
        <code className="font-mono">result</code> o <code className="font-mono">data</code>, se
        desenvuelve solo.
      </p>

      {error && <p className={ERROR_CLASSES}>{error}</p>}

      <Button variant="primary" onClick={load} className="self-start px-3 py-1 text-xs">
        Cargar fechas
      </Button>
    </>
  );
}
