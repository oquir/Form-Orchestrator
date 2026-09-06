import type { PanelBlockProps } from "./PanelBlock.types";

// Bloque plano separado por una linea que cruza todo el panel, al estilo del panel derecho de
// Figma. Convive a proposito con PanelSection, que es la tarjeta redondeada con velo: aquella
// agrupa controles dentro de un panel que ya tiene margenes -- los del sidebar izquierdo -- y esta
// divide un panel que llega hasta el borde. Unificarlas obligaria a repintar los ocho paneles de la
// izquierda, que no es lo que se pidio.
export function PanelBlock({ title, action, children }: PanelBlockProps) {
  return (
    <section className="border-b border-border px-3 py-3 last:border-b-0">
      <div className="mb-2 flex min-h-5 items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-fg-strong">{title}</h3>
        {action}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
