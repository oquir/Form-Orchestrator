// El velo y el marco son los del buscador del simulador (PreviewSearchSelect), el primer modal que
// se dibujo con cabecera y pie propios.
export const OVERLAY_CLASSES: string =
  "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4";

// max-h-full contra el padding del velo y el cuerpo como unico tramo con scroll: el titulo y las
// acciones no se van nunca de la pantalla. text-fg porque el modal no usa portal y se dibuja donde
// se abre: dentro del sidebar heredaria su gris.
export const PANEL_CLASSES: string =
  "flex max-h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-surface text-fg shadow-2xl";

export const HEADER_CLASSES: string =
  "flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 pt-5 pb-4";

export const EYEBROW_CLASSES: string =
  "inline-flex items-center gap-1.5 self-start rounded-full border border-brand-border/30 bg-brand-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-fg";

export const TITLE_CLASSES: string = "text-xl font-bold leading-snug tracking-tight text-fg-strong";

export const DESCRIPTION_CLASSES: string = "text-sm leading-relaxed text-fg-muted";

export const CLOSE_BUTTON_CLASSES: string =
  "-mt-1 -mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-fg-muted transition-colors hover:cursor-pointer hover:bg-surface-raised hover:text-fg-strong";

export const BODY_CLASSES: string = "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5";

export const FOOTER_CLASSES: string = "shrink-0 border-t border-border bg-surface-sunken px-6 py-4";
