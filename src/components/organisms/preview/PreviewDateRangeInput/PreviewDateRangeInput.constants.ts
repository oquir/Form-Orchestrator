// Las dos fechas lado a lado mientras quepan, una debajo de la otra si el campo es angosto: un input
// date no baja de unos 9rem sin cortar el dd/mm/aaaa, y con la hora necesita unos 13rem. Son dos
// cadenas literales porque Tailwind lee el codigo fuente: una clase armada al vuelo no llega al CSS.
export const RANGE_GRID_CLASSES: string =
  "grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2";

export const RANGE_GRID_WITH_TIME_CLASSES: string =
  "grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-2";

export const END_CLASSES: string = "flex min-w-0 flex-col gap-1";

export const END_CAPTION_CLASSES: string = "text-[11px] text-fg-muted";
