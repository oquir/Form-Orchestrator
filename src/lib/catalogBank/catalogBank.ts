import type {
  CatalogBank,
  CatalogEntry,
  CatalogParseResult,
  StoredCatalog,
} from "../../types/catalog";
import { CATALOG_BANK_KEY } from "./catalogBank.constants";
import { catalogBankSchema } from "./catalogBank.schema";
import { findArray, readKey } from "./catalogBank.utils";

export function loadCatalogBank(): CatalogBank {
  const raw: string | null = localStorage.getItem(CATALOG_BANK_KEY);
  if (!raw) return {};

  try {
    const parsed = catalogBankSchema.safeParse(JSON.parse(raw));

    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

export function saveCatalogBank(bank: CatalogBank): void {
  localStorage.setItem(CATALOG_BANK_KEY, JSON.stringify(bank));
}

// Un catalogo en "default", o cargado pero vacio, se comporta como si no estuviera.
export function usesCustomCatalog(bank: CatalogBank, catalogId: string): boolean {
  const stored: StoredCatalog | undefined = bank[catalogId];

  return stored !== undefined && stored.source === "custom" && stored.entries.length > 0;
}

export function catalogEntriesFor(
  bank: CatalogBank,
  catalogId: string,
  parentId?: string,
): CatalogEntry[] {
  const entries: CatalogEntry[] = bank[catalogId]?.entries ?? [];
  if (parentId === undefined) return entries;

  return entries.filter((entry) => entry.parentId === parentId);
}

// Convierte la respuesta cruda de un endpoint en opciones. Para 1.100 municipios pegar el JSON es
// la unica via sensata; teclear id y etiqueta fila por fila no lo hace nadie.
export function parseCatalogPaste(
  raw: string,
  idKey: string,
  labelKey: string,
  parentKey?: string,
): CatalogParseResult {
  if (raw.trim() === "") return { entries: [], error: "Pegá la respuesta del endpoint." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { entries: [], error: "No es JSON válido." };
  }

  const items: unknown[] | null = findArray(parsed);
  if (!items) return { entries: [], error: "No encontré ninguna lista dentro del JSON." };

  const entries: CatalogEntry[] = [];
  for (const item of items) {
    const id: string | undefined = readKey(item, idKey);
    if (id === undefined) continue;

    const parentId: string | undefined = parentKey ? readKey(item, parentKey) : undefined;
    entries.push({ id, label: readKey(item, labelKey) ?? id, ...(parentId ? { parentId } : {}) });
  }

  if (entries.length === 0) {
    return { entries: [], error: `Ningún elemento traía el campo “${idKey}”.` };
  }

  return { entries, error: null };
}
