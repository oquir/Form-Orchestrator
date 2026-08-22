import { MaxDatesAnioRow } from "../MaxDatesAnioRow/MaxDatesAnioRow";
import { PanelSection } from "../PanelSection/PanelSection";
import {
  BADGE_EMPTY_CLASSES,
  BADGE_LOADED_CLASSES,
  HINT_CLASSES,
} from "./MaxDatesDeclaracionSection.constants";
import type { MaxDatesDeclaracionSectionProps } from "./MaxDatesDeclaracionSection.types";

export function MaxDatesDeclaracionSection({
  kind,
  label,
  reglas,
  onEditFecha,
}: MaxDatesDeclaracionSectionProps) {
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
            <MaxDatesAnioRow
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
