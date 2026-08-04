export interface CatalogDefinition {
  id: string;
  label: string;
  // Un catalogo parametrizado no devuelve nada mientras no se elija el campo padre.
  requiresParent?: boolean;
}

export interface CatalogEntry {
  id: string;
  label: string;
  // Solo en catalogos parametrizados: a que valor del padre pertenece esta opcion.
  parentId?: string;
}

// Vive fuera del borrador y fuera del export: son datos del simulador, y se comparten entre
// formularios porque el catalogo de departamentos es el mismo en todos.
export type CatalogBank = Record<string, CatalogEntry[]>;

export interface CatalogParseResult {
  entries: CatalogEntry[];
  error: string | null;
}
