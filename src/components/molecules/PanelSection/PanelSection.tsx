import type { PanelSectionProps } from "./PanelSection.types";

// Agrupa los controles del panel en tarjetas con un rotulo chico. Antes era una lista plana de
// campos separados solo por espacio, y con doce controles seguidos no habia forma de saber cual
// tenia que ver con cual.
export function PanelSection({ title, aside, children }: PanelSectionProps) {
  return (
    // Un velo negro y no un token de superficie: la tarjeta tiene que quedar apenas mas oscura que
    // el panel, y entre surface (neutral-900) y surface-sunken (neutral-950) no hay ningun paso
    // intermedio en la escala. Al ser translucido oscurece relativo a lo que tenga detras, asi que
    // el mismo valor sirve en claro y en oscuro.
    <section className="rounded-lg border border-border bg-black/5 p-3 dark:bg-black/25">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">
          {title}
        </h3>
        {aside}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
