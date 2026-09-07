import { FIELD_TYPE_ICONS } from "../../../constants/fieldTypeIcons";
import { FIELD_TYPES } from "../../../constants/fieldTypes";
import type { FieldTypeBadgeProps } from "./FieldTypeBadge.types";

// Icono y no el tipo crudo en mayusculas: el mismo lenguaje que ya usan la paleta y el panel de
// atributos, que era lo unico que el lienzo no compartia. El nombre legible viaja en el title.
export function FieldTypeBadge({ type, size = 12 }: FieldTypeBadgeProps) {
  const Icon = FIELD_TYPE_ICONS[type];
  const typeLabel: string = FIELD_TYPES.find((candidate) => candidate.type === type)?.label ?? type;

  if (!Icon) return null;

  return (
    <span title={typeLabel} className="flex shrink-0 items-center text-fg-subtle">
      <Icon size={size} />
    </span>
  );
}
