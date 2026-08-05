import type {
  CatalogBank,
  CatalogEntry,
  CatalogParseResult,
  CatalogPasteKeys,
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
export function parseCatalogPaste(raw: string, keys: CatalogPasteKeys): CatalogParseResult {
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
    const id: string | undefined = readKey(item, keys.id);
    if (id === undefined) continue;

    const parentId: string | undefined = keys.parent ? readKey(item, keys.parent) : undefined;
    const code: string | undefined = keys.code ? readKey(item, keys.code) : undefined;
    // Una tarifa que no es numero se descarta en vez de viajar como NaN: el distintivo simplemente
    // no se dibuja, que es lo mismo que pasa cuando el volcado no trae la columna.
    const tarifa: number | undefined = keys.tarifa
      ? toTarifa(readKey(item, keys.tarifa))
      : undefined;

    entries.push({
      id,
      label: readKey(item, keys.label) ?? id,
      ...(parentId ? { parentId } : {}),
      ...(code ? { code } : {}),
      ...(tarifa !== undefined ? { tarifa } : {}),
    });
  }

  if (entries.length === 0) {
    return { entries: [], error: `Ningún elemento traía el campo “${keys.id}”.` };
  }

  return { entries, error: null };
}

function toTarifa(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;

  // Coma decimal: los volcados de tarifas vienen con punto, pero el que pega puede traer otra cosa.
  const parsed: number = Number(raw.replace(",", "."));

  return Number.isFinite(parsed) ? parsed : undefined;
}
