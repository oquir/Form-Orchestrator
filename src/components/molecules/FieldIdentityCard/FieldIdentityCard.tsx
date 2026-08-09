import { FIELD_TYPE_ICONS } from "../../../constants/fieldTypeIcons";
import { FIELD_TYPES } from "../../../constants/fieldTypes";
import type { FieldIdentityCardProps } from "./FieldIdentityCard.types";

// Ancla del panel: contra que campo se esta trabajando. El encabezado ya dice el nombre tecnico,
// asi que aca va la otra mitad -el texto que ve el contribuyente y el tipo-, y por eso absorbe el
// campo "Tipo" que antes era una entrada deshabilitada sin nada que editar.
export function FieldIdentityCard({ field, linkedLabel }: FieldIdentityCardProps) {
  const Icon = FIELD_TYPE_ICONS[field.type];
  const typeLabel: string =
    FIELD_TYPES.find((candidate) => candidate.type === field.type)?.label ?? field.type;
  const visibleLabel: string = linkedLabel ? linkedLabel.label : field.label;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-brand-border bg-brand-surface p-3">
      {Icon && (
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface text-brand-fg">
          <Icon size={15} />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-fg-strong">
          {visibleLabel || <span className="italic text-fg-subtle">Sin texto</span>}
        </p>
        <p className="mt-0.5 text-[11px] text-fg-muted">
          {typeLabel}
          {linkedLabel && " · el texto lo aporta una etiqueta ligada"}
        </p>
      </div>
    </div>
  );
}
