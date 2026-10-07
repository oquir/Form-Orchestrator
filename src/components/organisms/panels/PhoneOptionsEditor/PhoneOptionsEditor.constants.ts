import type { PhoneKind } from "../../../../types/fieldContact";

export const PHONE_DESCRIPTION: string =
  "Qué número pide el campo. Cada uno valida con su propio formato: un celular son 10 dígitos que empiezan por 3, y un fijo son 10 dígitos que empiezan por 60 y el indicativo de la región, como 6011234567 en Bogotá. Una expresión propia en Validaciones reemplaza a cualquiera de los dos.";

export const KIND_CHOICES: { kind: PhoneKind; label: string }[] = [
  { kind: "celular", label: "Celular" },
  { kind: "fijo", label: "Fijo" },
];

// El mismo control segmentado que Fecha única / Rango de fechas.
export const KIND_TRACK_CLASSES: string =
  "grid grid-cols-2 gap-0.5 rounded-md border border-border bg-field p-[3px]";

export const KIND_ITEM_BASE_CLASSES: string =
  "rounded px-2 py-1 text-xs font-medium transition-colors hover:cursor-pointer";

export const KIND_ITEM_ACTIVE_CLASSES: string = "bg-brand text-on-brand shadow-sm";

export const KIND_ITEM_INACTIVE_CLASSES: string =
  "text-fg-muted hover:bg-surface-raised hover:text-fg-strong dark:hover:bg-surface-inset";
