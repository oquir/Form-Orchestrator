// El error se pinta con ring y no con border: Input ya trae su propia clase de borde y cual de las
// dos gana depende del orden en que Tailwind las emita, no del orden en el className.
export const ERROR_INPUT_CLASSES: string = "ring-1 ring-red-400 dark:ring-red-500";

export const ERROR_CLASSES: string = "text-[11px] text-red-600 dark:text-red-400";

export const PREVIEW_CLASSES: string = "text-[11px] text-slate-500 dark:text-neutral-400";

export const HINT_CLASSES: string = "text-[11px] text-slate-400 dark:text-neutral-500";
