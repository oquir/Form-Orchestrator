import { fechasEsperadas } from "../../../lib/maxDates/maxDates";
import {
  BADGE_LOADED_CLASSES,
  BADGE_PARCIAL_CLASSES,
  DATE_INPUT_CLASSES,
  DIGITO_LABEL,
  HINT_CLASSES,
  PERIODICIDAD_LABEL,
} from "./MaxDatesAnioRow.constants";
import type { MaxDatesAnioRowProps } from "./MaxDatesAnioRow.types";

export function MaxDatesAnioRow({ regla, onEditFecha }: MaxDatesAnioRowProps) {
  const esperadas: number = fechasEsperadas(regla);
  const completo: boolean = regla.fechas.length === esperadas;
  // Solo el caso simple se teclea. Los demas van de 6 a 120 fechas, y eso no lo carga nadie a mano.
  const editable: boolean = regla.periodicidad === "anual" && regla.tipoDigito === "ninguno";

  return (
    <li className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-medium tabular-nums text-fg">{regla.anio}</span>
        {/* Anual y sin digito es el caso por defecto y el input de al lado ya lo dice: repetirlo
            en los diez anos son diez lineas identicas que no informan nada. */}
        {!editable && (
          <span className={`${HINT_CLASSES} truncate`}>
            {PERIODICIDAD_LABEL[regla.periodicidad]} · {DIGITO_LABEL[regla.tipoDigito]}
          </span>
        )}
      </div>

      {editable ? (
        <input
          value={regla.fechas[0]?.fecha ?? ""}
          onChange={(event) => onEditFecha(event.target.value)}
          placeholder="YYYY/MM/DD"
          aria-label={`Fecha máxima del año ${regla.anio}`}
          className={DATE_INPUT_CLASSES}
        />
      ) : (
        <span className={completo ? BADGE_LOADED_CLASSES : BADGE_PARCIAL_CLASSES}>
          {regla.fechas.length}/{esperadas} fechas
        </span>
      )}
    </li>
  );
}
