import { CATALOG_COLUMNS } from "../../../../constants/catalog";
import { getActiveRows, getAllFields, useFormStore } from "../../../../store/formStore";
import type { CatalogColumn } from "../../../../types/catalog";
import type { CanvasField, CatalogFill } from "../../../../types/field";
import type { CatalogFillsEditorProps } from "./CatalogFillsEditor.types";
import { fillTargetCandidates, removeFill, replaceFill } from "./CatalogFillsEditor.utils";

const SELECT_CLASSES: string =
  "min-w-0 flex-1 rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border";

export function CatalogFillsEditor({ field }: CatalogFillsEditorProps) {
  const updateFieldDataSource = useFormStore((state) => state.updateFieldDataSource);
  const activeRows = useFormStore(getActiveRows);

  if (!field.dataSource) return null;

  const fills: CatalogFill[] = field.dataSource.fills ?? [];
  const candidates: CanvasField[] = fillTargetCandidates(getAllFields(activeRows), field.id);

  function commit(next: CatalogFill[]): void {
    if (!field.dataSource) return;

    updateFieldDataSource(field.id, {
      ...field.dataSource,
      fills: next.length > 0 ? next : undefined,
    });
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-fg-soft">Rellenar otros campos</span>
        <button
          type="button"
          disabled={candidates.length === 0}
          onClick={() => commit([...fills, { column: "code", field: candidates[0].id }])}
          className="text-[11px] text-brand-fg hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Agregar
        </button>
      </div>

      <p className="text-[10px] text-fg-subtle">
        Al elegir una opción, estas columnas se copian a los campos indicados. Es lo que llena solos
        el código y la tarifa de una actividad, sin que el contribuyente los escriba.
      </p>

      {candidates.length === 0 && (
        <p className="text-[10px] text-fg-subtle">No hay otros campos en este paso.</p>
      )}

      <ul className="flex list-none flex-col gap-1.5">
        {fills.map((fill, index) => (
          <li key={`${fill.column}-${fill.field}`} className="flex items-center gap-1.5">
            <select
              value={fill.column}
              onChange={(event) =>
                commit(
                  replaceFill(fills, index, {
                    ...fill,
                    column: event.target.value as CatalogColumn,
                  }),
                )
              }
              className={SELECT_CLASSES}
            >
              {CATALOG_COLUMNS.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.label}
                </option>
              ))}
            </select>

            <span className="text-[11px] text-fg-subtle">→</span>

            <select
              value={fill.field}
              onChange={(event) =>
                commit(replaceFill(fills, index, { ...fill, field: event.target.value }))
              }
              className={SELECT_CLASSES}
            >
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => commit(removeFill(fills, index))}
              title="Quitar"
              className="shrink-0 rounded px-1 text-xs text-fg-subtle hover:cursor-pointer hover:text-danger"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
