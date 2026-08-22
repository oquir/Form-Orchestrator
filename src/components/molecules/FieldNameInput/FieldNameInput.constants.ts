export { ERROR_CLASSES, HINT_CLASSES } from "../../../constants/uiClasses";

// El error se pinta con ring y no con border: Input ya trae su propia clase de borde y cual de las
// dos gana depende del orden en que Tailwind las emita, no del orden en el className.
export const ERROR_INPUT_CLASSES: string = "ring-1 ring-red-400 dark:ring-red-500";

export const PREVIEW_CLASSES: string = "text-[11px] text-slate-500 dark:text-neutral-400";
