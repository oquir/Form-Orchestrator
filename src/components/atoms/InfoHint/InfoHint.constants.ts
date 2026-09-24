export const TRIGGER_CLASSES: string = "flex items-center transition-colors hover:cursor-pointer";

export const TRIGGER_IDLE_CLASSES: string = "text-fg-subtle hover:text-brand-fg";

export const TRIGGER_PINNED_CLASSES: string = "text-brand-fg";

// inset-x-0 y no un ancho fijo: toma el de la fila que la ancla (ver InfoHint), asi que nunca se
// sale por el costado del panel, cuyo overflow-y-auto la recortaria o le sumaria scroll horizontal.
export const BUBBLE_CLASSES: string =
  "absolute inset-x-0 top-full z-30 mt-1.5 rounded-md bg-slate-800 px-2.5 py-2 text-[11px] leading-relaxed text-white shadow-lg dark:bg-neutral-700";
