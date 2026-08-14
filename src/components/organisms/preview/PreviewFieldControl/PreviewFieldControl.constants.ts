export const CONTROL_BASE_CLASSES: string =
  "w-full rounded-md border bg-field px-2.5 py-1.5 text-sm text-fg outline-none transition-colors disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-fg-muted";

export const CONTROL_IDLE_CLASSES: string = "border-border focus:border-brand-border";

export const CONTROL_INVALID_CLASSES: string = "border-danger-soft focus:border-danger";

export const CHIP_BASE_CLASSES: string =
  "rounded-md border px-2.5 py-1 text-xs transition-colors hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

export const CHIP_ACTIVE_CLASSES: string = "border-brand-border bg-brand-surface text-brand-fg";

export const CHIP_IDLE_CLASSES: string = "border-border bg-field text-fg-soft";

export const OPTION_ROW_CLASSES: string =
  "flex items-center gap-2 text-sm text-fg-soft hover:cursor-pointer";

export const STACKED_OPTIONS_CLASSES: string = "flex flex-col gap-1";

// wrap y no nowrap: en linea es una preferencia de disposicion, no una promesa de que entren. Con
// cuatro opciones largas en pocas columnas se pasan a la siguiente en vez de desbordar la fila.
export const INLINE_OPTIONS_CLASSES: string = "flex flex-wrap items-center gap-x-4 gap-y-1";
