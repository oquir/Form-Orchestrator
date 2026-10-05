import { InfoHint } from "../../atoms/InfoHint/InfoHint";
import type { PanelSectionProps } from "./PanelSection.types";

// Agrupa los controles del panel en tarjetas con un rotulo chico. Antes era una lista plana de
// campos separados solo por espacio, y con doce controles seguidos no habia forma de saber cual
// tenia que ver con cual.
export function PanelSection({ title, description, aside, children }: PanelSectionProps) {
  return (
    // En oscuro, un velo negro y no un token: la tarjeta tiene que quedar apenas mas oscura que el
    // panel, y entre surface (neutral-900) y surface-sunken (neutral-950) no hay paso intermedio. En
    // claro la tarjeta es blanca como el panel y la separa solo el borde: border-strong, porque el
    // border normal (slate-200) sobre blanco casi no se ve.
    <section className="flex flex-col gap-3 rounded-lg border border-border-strong bg-surface p-3 dark:border-border dark:bg-black/25">
      {/* relative ancla la burbuja de la descripcion: toma el ancho de esta fila, el de la tarjeta. */}
      <div className="relative flex items-center justify-between gap-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {aside}
          {description && <InfoHint text={description} label={`Ayuda sobre ${title}`} />}
        </div>
      </div>
      {/* Una seccion puede quedar sin cuerpo (un interruptor solo, con su explicacion en la
          descripcion): empty:hidden evita que el hueco del gap la haga mas alta que su rotulo. */}
      <div className="flex flex-col gap-3 empty:hidden">{children}</div>
    </section>
  );
}
