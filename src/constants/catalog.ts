import type { CatalogDefinition } from "../types/catalog";

// Nombres de catalogo del contrato: el consumidor los traduce a su endpoint real.
export const CATALOG_DEPARTAMENTOS: string = "departamentos";

export const CATALOG_MUNICIPIOS: string = "municipios";

// Lista cerrada a proposito, igual que PAYLOAD_SCHEMA: un nombre tecleado a mano rompe al
// consumidor en silencio. Agregar un catalogo es una linea aca y otra en MOCK_CATALOGS.
export const CATALOGS: CatalogDefinition[] = [
  { id: CATALOG_DEPARTAMENTOS, label: "Departamentos" },
  { id: CATALOG_MUNICIPIOS, label: "Municipios", requiresParent: true },
];

export function findCatalog(id: string): CatalogDefinition | undefined {
  return CATALOGS.find((catalog) => catalog.id === id);
}
