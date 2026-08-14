import { Plus, Trash } from "reicon-react";
import { checkKey } from "../../../../lib/runtimeValidation/runtimeValidation.utils";
import type { ExportedRepeatableGroup } from "../../../../types/exportForm";
import type { RuntimeScope } from "../../../../types/formRuntime";
import { PreviewRowsGrid } from "../PreviewRowsGrid/PreviewRowsGrid";
import type { PreviewGroupBandProps } from "./PreviewGroupBand.types";

export function PreviewGroupBand({ groupId, rows, preview }: PreviewGroupBandProps) {
  const group: ExportedRepeatableGroup | undefined = preview.model.groupsById.get(groupId);
  const scopes: RuntimeScope[] = preview.snapshot.groups[groupId] ?? [];
  const canAdd = scopes.length < (group?.max ?? 15);
  const canRemove = scopes.length > (group?.min ?? 1);

  // El error de una comprobacion es del grupo entero, no de una fila, asi que se dibuja arriba de
  // las repeticiones. Como cualquier otro error, solo aparece una vez revelado: nadie ve rojo en
  // una pantalla a la que todavia no llego.
  const checkErrors: string[] = (group?.checks ?? []).flatMap((check) => {
    const key: string = checkKey(groupId, check.id);

    return preview.revealed[key] && preview.errors[key] ? [preview.errors[key]] : [];
  });

  return (
    <section className="rounded-lg border border-border bg-surface-sunken p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-fg-strong">{group?.title ?? "Grupo"}</p>
          <p className="text-[11px] text-fg-subtle">
            {scopes.length} de {group?.max ?? 15} · mínimo {group?.min ?? 1}
          </p>
        </div>
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => preview.addGroupItem(groupId)}
          className="flex items-center gap-1 rounded-md border border-brand-border px-2 py-1 text-xs font-medium text-brand-fg hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={12} />
          Agregar
        </button>
      </header>

      {checkErrors.length > 0 && (
        <ul className="mb-3 flex list-none flex-col gap-1 rounded-md border border-danger-border bg-danger-surface p-2.5">
          {checkErrors.map((message) => (
            <li key={message} className="text-[11px] text-danger">
              {message}
            </li>
          ))}
        </ul>
      )}

      <ul className="flex list-none flex-col gap-3">
        {scopes.map((scope, index) => (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: las repeticiones no tienen id propio
            key={index}
            className="rounded-md border border-border bg-surface p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wide text-fg-subtle">
                #{index + 1}
              </span>
              <button
                type="button"
                disabled={!canRemove}
                onClick={() => preview.removeGroupItem(groupId, index)}
                title={canRemove ? "Eliminar" : `Debe haber al menos ${group?.min ?? 1}`}
                className="text-fg-subtle hover:cursor-pointer hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash size={13} />
              </button>
            </div>

            <PreviewRowsGrid
              rows={rows}
              scope={scope}
              preview={preview}
              groupId={groupId}
              itemIndex={index}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
