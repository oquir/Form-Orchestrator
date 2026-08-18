import { useState } from "react";
import { parseCatalogPaste } from "../../../lib/catalogBank/catalogBank";
import { DEFAULT_ID_KEY, DEFAULT_LABEL_KEY } from "../../../lib/catalogBank/catalogBank.constants";
import { useFormStore } from "../../../store/formStore";
import type { CatalogEntry, CatalogParseResult } from "../../../types/catalog";
import { Button } from "../../atoms/Button/Button";
import { BinaryChoiceToggle } from "../BinaryChoiceToggle/BinaryChoiceToggle";
import { PanelSection } from "../PanelSection/PanelSection";
import {
  ACTION_CLASSES,
  BADGE_EMPTY_CLASSES,
  BADGE_LOADED_CLASSES,
  ERROR_CLASSES,
  HINT_CLASSES,
  INPUT_CLASSES,
  PASTE_PLACEHOLDER,
  TEXTAREA_CLASSES,
} from "./CatalogCard.constants";
import type { CatalogCardProps } from "./CatalogCard.types";

export function CatalogCard({ catalog, stored }: CatalogCardProps) {
  const setCatalogEntries = useFormStore((state) => state.setCatalogEntries);
  const setCatalogSource = useFormStore((state) => state.setCatalogSource);
  const clearCatalogEntries = useFormStore((state) => state.clearCatalogEntries);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [raw, setRaw] = useState<string>("");
  const [idKey, setIdKey] = useState<string>(DEFAULT_ID_KEY);
  const [labelKey, setLabelKey] = useState<string>(DEFAULT_LABEL_KEY);
  const [parentKey, setParentKey] = useState<string>("");
  const [codeKey, setCodeKey] = useState<string>("");
  const [tarifaKey, setTarifaKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const entries: CatalogEntry[] = stored?.entries ?? [];
  const loaded: boolean = entries.length > 0;
  const isCustom: boolean = loaded && stored?.source === "custom";
  const badge: string = loaded ? `${entries.length} opciones` : "Sin cargar";

  function load(): void {
    const result: CatalogParseResult = parseCatalogPaste(raw, {
      id: idKey,
      label: labelKey,
      parent: catalog.requiresParent && parentKey.trim() ? parentKey.trim() : undefined,
      code: codeKey.trim() || undefined,
      tarifa: tarifaKey.trim() || undefined,
    });

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
    <PanelSection
      title={catalog.label}
      aside={<span className={loaded ? BADGE_LOADED_CLASSES : BADGE_EMPTY_CLASSES}>{badge}</span>}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={HINT_CLASSES}>
          {catalog.requiresParent
            ? "Se consulta por un campo padre"
            : "Se consulta completo, sin filtro"}
        </p>
        <button type="button" onClick={() => setIsOpen(!isOpen)} className={ACTION_CLASSES}>
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

          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className={HINT_CLASSES}>Campo del código (opcional)</span>
              <input
                value={codeKey}
                onChange={(event) => setCodeKey(event.target.value)}
                placeholder="Ej. codigoCIIU"
                className={INPUT_CLASSES}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={HINT_CLASSES}>Campo de la tarifa (opcional)</span>
              <input
                value={tarifaKey}
                onChange={(event) => setTarifaKey(event.target.value)}
                placeholder="Ej. tarifaXMil"
                className={INPUT_CLASSES}
              />
            </label>
          </div>

          <p className={HINT_CLASSES}>
            Las dos últimas solo las usa el buscador de un campo tipo “Selector con búsqueda”: el
            código encabeza cada fila y la tarifa se muestra al costado como 4X1000.
          </p>

          {error && <p className={ERROR_CLASSES}>{error}</p>}

          <Button variant="primary" onClick={load} className="self-start px-3 py-1 text-xs">
            Cargar opciones
          </Button>
        </>
      )}
    </PanelSection>
  );
}
