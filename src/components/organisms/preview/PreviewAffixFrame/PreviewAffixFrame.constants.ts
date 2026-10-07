// El marco hace de input: borde, fondo y foco pasan al contenedor, y el input de adentro queda
// transparente. Asi el $ se lee dentro de la caja, como en un formulario de papel, y el foco y el
// rojo de error rodean al numero y a su unidad juntos.
export const FRAME_BASE_CLASSES: string =
  "flex w-full items-center gap-1.5 rounded-md border bg-field px-2.5 text-sm transition-colors has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-surface-raised";

export const FRAME_IDLE_CLASSES: string = "border-border focus-within:border-brand-border";

export const FRAME_INVALID_CLASSES: string = "border-danger-soft focus-within:border-danger";

export const AFFIX_CLASSES: string = "shrink-0 select-none text-fg-muted";

export const AFFIX_INPUT_CLASSES: string =
  "min-w-0 flex-1 bg-transparent py-1.5 text-fg outline-none disabled:cursor-not-allowed disabled:text-fg-muted";
