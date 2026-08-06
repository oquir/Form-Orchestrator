import { CATALOGS, findCatalog } from "../../../../constants/catalog";
import { useFormStore } from "../../../../store/formStore";
import { Checkbox } from "../../../atoms/Checkbox/Checkbox";
import {
  HINT_CLASSES,
  NO_PARENT_VALUE,
  SELECT_CLASSES,
  WARNING_CLASSES,
} from "./FieldDataSourceEditor.constants";
import type { FieldDataSourceEditorProps } from "./FieldDataSourceEditor.types";

export function FieldDataSourceEditor({ field, candidates }: FieldDataSourceEditorProps) {
  const updateFieldDataSource = useFormStore((state) => state.updateFieldDataSource);

  const source = field.dataSource;
  const catalog = source ? findCatalog(source.catalog) : undefined;
  const parentIsDead =
    source?.dependsOn !== undefined && !candidates.some((c) => c.id === source.dependsOn);
  const needsParent = Boolean(catalog?.requiresParent) && source?.dependsOn === undefined;

  function toggle(checked: boolean): void {
    updateFieldDataSource(field.id, checked ? { catalog: CATALOGS[0].id } : null);
  }

  function changeCatalog(catalogId: string): void {
    updateFieldDataSource(field.id, { catalog: catalogId, dependsOn: source?.dependsOn });
  }

  function changeParent(fieldId: string): void {
    if (!source) return;
    updateFieldDataSource(field.id, {
      catalog: source.catalog,
      dependsOn: fieldId === NO_PARENT_VALUE ? undefined : fieldId,
    });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-neutral-700">
      {/* biome-ignore lint/a11y/noLabelWithoutControl: Checkbox renders a nested <input type="checkbox"> */}
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-neutral-200">
        <Checkbox
          checked={source !== undefined}
          onChange={(event) => toggle(event.target.checked)}
        />
        Las opciones vienen de un catálogo
      </label>

      {source === undefined ? (
        <p className={HINT_CLASSES}>
          Marcálo si el aplicativo que recibe el JSON tiene que pedir estas opciones a un catálogo.
          Queda escrito en el export, así no hay que pactarlo de palabra.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">Catálogo</span>
            <select
              value={source.catalog}
              onChange={(event) => changeCatalog(event.target.value)}
              className={SELECT_CLASSES}
            >
              {!catalog && <option value={source.catalog}>{source.catalog} (desconocido)</option>}
              {CATALOGS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
              Se consulta por (opcional)
            </span>
            <select
              value={source.dependsOn ?? NO_PARENT_VALUE}
              onChange={(event) => changeParent(event.target.value)}
              className={SELECT_CLASSES}
            >
              <option value={NO_PARENT_VALUE}>— Nada, el catálogo es completo —</option>
              {parentIsDead && source.dependsOn && (
                <option value={source.dependsOn}>(Campo eliminado — reasignar)</option>
              )}
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.label} ({candidate.type})
                </option>
              ))}
            </select>
          </div>

          {needsParent && (
            <p className={WARNING_CLASSES}>
              “{catalog?.label}” se consulta por un campo padre. Sin elegirlo, el consumidor no sabe
              con qué filtrar y el campo va a quedar sin opciones.
            </p>
          )}

          <p className={HINT_CLASSES}>
            Las opciones no viajan en el JSON: solo viaja el nombre del catálogo, que el aplicativo
            traduce a su endpoint.
          </p>
        </>
      )}
    </div>
  );
}
