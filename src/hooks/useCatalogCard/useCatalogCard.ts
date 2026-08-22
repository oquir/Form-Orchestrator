import { useState } from "react";
import { DEFAULT_ID_KEY, DEFAULT_LABEL_KEY } from "../../constants/catalogBank";
import { parseCatalogPaste } from "../../lib/catalogBank/catalogBank";
import { useFormStore } from "../../store/formStore";
import type { CatalogEntry, CatalogParseResult } from "../../types/catalog";
import type { UseCatalogCardParams, UseCatalogCardResult } from "./useCatalogCard.types";

// Estado y logica para la tarjeta de configuracion de cada catalogo en el panel de catalogos.
export function useCatalogCard({ catalog, stored }: UseCatalogCardParams): UseCatalogCardResult {
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

  return {
    isOpen,
    setIsOpen,
    raw,
    setRaw,
    idKey,
    setIdKey,
    labelKey,
    setLabelKey,
    parentKey,
    setParentKey,
    codeKey,
    setCodeKey,
    tarifaKey,
    setTarifaKey,
    error,
    entries,
    loaded,
    isCustom,
    badge,
    load,
    setSource: (source) => setCatalogSource(catalog.id, source),
    clear: () => clearCatalogEntries(catalog.id),
  };
}
