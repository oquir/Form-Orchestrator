import { useState } from "react";
import { CATALOGS } from "../../../../constants/catalog";
import { parseCatalogPaste } from "../../../../lib/catalogBank/catalogBank";
import {
  DEFAULT_ID_KEY,
  DEFAULT_LABEL_KEY,
} from "../../../../lib/catalogBank/catalogBank.constants";
import { useFormStore } from "../../../../store/formStore";
import type { CatalogEntry, CatalogParseResult } from "../../../../types/catalog";
import { Button } from "../../../atoms/Button/Button";
import { BinaryChoiceToggle } from "../../../molecules/BinaryChoiceToggle/BinaryChoiceToggle";
import {
  CARD_CLASSES,
  ERROR_CLASSES,
  HINT_CLASSES,
  INPUT_CLASSES,
  PASTE_PLACEHOLDER,
  TEXTAREA_CLASSES,
} from "./CatalogsPanel.constants";
import type { CatalogCardProps } from "./CatalogsPanel.types";

export function CatalogsPanel() {
  const catalogBank = useFormStore((state) => state.catalogBank);

  return (
    <div className="flex flex-col gap-4">
      <p className={HINT_CLASSES}>
        Las opciones que el simulador ofrece en cada campo de catálogo. Cada uno elige entre los
        datos de prueba que trae el simulador y los que cargues vos; cambiar de uno a otro no borra
        lo cargado. No viajan en el JSON exportado y no dependen del borrador: se comparten entre
        todos tus formularios, así que los departamentos que cargues acá los hereda el de retención.
      </p>

      {CATALOGS.map((catalog) => (
        <CatalogCard key={catalog.id} catalog={catalog} stored={catalogBank[catalog.id]} />
      ))}
    </div>
  );
}

function CatalogCard({ catalog, stored }: CatalogCardProps) {
  const setCatalogEntries = useFormStore((state) => state.setCatalogEntries);
  const setCatalogSource = useFormStore((state) => state.setCatalogSource);
  const clearCatalogEntries = useFormStore((state) => state.clearCatalogEntries);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [raw, setRaw] = useState<string>("");
  const [idKey, setIdKey] = useState<string>(DEFAULT_ID_KEY);
  const [labelKey, setLabelKey] = useState<string>(DEFAULT_LABEL_KEY);
  const [parentKey, setParentKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const entries: CatalogEntry[] = stored?.entries ?? [];
  const loaded: boolean = entries.length > 0;
  const isCustom: boolean = loaded && stored?.source === "custom";

  function load(): void {
    const result: CatalogParseResult = parseCatalogPaste(
      raw,
      idKey,
      labelKey,
      catalog.requiresParent && parentKey.trim() ? parentKey.trim() : undefined,
    );

    if (result.error) {
      setError(result.error);
      return;
    }

    setCatalogEntries(catalog.id, result.entries);
    setError(null);
    setRaw("");
    setIsOpen(false);
  }

  return (
    <div className={CARD_CLASSES}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-700 dark:text-neutral-200">
            {catalog.label}
          </p>
          <p className={HINT_CLASSES}>
            {loaded ? `${entries.length} opciones cargadas` : "Sin cargar"}
            {catalog.requiresParent && " · se consulta por un campo padre"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="shrink-0 text-xs font-medium text-orange-600 hover:cursor-pointer hover:text-orange-500 dark:text-orange-500"
        >
          {isOpen ? "Cerrar" : loaded ? "Reemplazar" : "Cargar"}
        </button>
      </div>

      {loaded && !isOpen && (
        <>
          <BinaryChoiceToggle
            value={isCustom}
            onChange={(next) => setCatalogSource(catalog.id, next ? "custom" : "default")}
            yesLabel="Personalizado"
            noLabel="Por defecto"
          />

          <div className="flex items-center justify-between gap-2">
            <p className={`${HINT_CLASSES} truncate`}>
              {isCustom
                ? entries
                    .slice(0, 3)
                    .map((entry: CatalogEntry) => entry.label)
                    .join(" · ")
                : "Usando los datos de prueba del simulador"}
              {isCustom && entries.length > 3 && " …"}
            </p>
            <button
              type="button"
              onClick={() => clearCatalogEntries(catalog.id)}
              className="shrink-0 text-[11px] text-slate-400 hover:cursor-pointer hover:text-red-600 dark:text-neutral-500"
            >
              Vaciar
            </button>
          </div>
        </>
      )}

      {isOpen && (
        <>
          <textarea
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            placeholder={PASTE_PLACEHOLDER}
            aria-label={`Respuesta del endpoint de ${catalog.label}`}
            className={TEXTAREA_CLASSES}
          />

          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className={HINT_CLASSES}>Campo del id</span>
              <input
                value={idKey}
                onChange={(event) => setIdKey(event.target.value)}
                className={INPUT_CLASSES}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={HINT_CLASSES}>Campo de la etiqueta</span>
              <input
                value={labelKey}
                onChange={(event) => setLabelKey(event.target.value)}
                className={INPUT_CLASSES}
              />
            </label>
          </div>

          {catalog.requiresParent && (
            <label className="flex flex-col gap-1">
              <span className={HINT_CLASSES}>Campo que apunta al padre</span>
              <input
                value={parentKey}
                onChange={(event) => setParentKey(event.target.value)}
                placeholder="Ej. idDepartamento"
                className={INPUT_CLASSES}
              />
            </label>
          )}

          {error && <p className={ERROR_CLASSES}>{error}</p>}

          <Button variant="primary" onClick={load} className="px-3 py-1 text-xs">
            Cargar opciones
          </Button>
        </>
      )}
    </div>
  );
}
