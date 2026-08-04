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

export type CatalogSource = "default" | "custom";

// Volver a "default" no borra lo cargado, solo lo ignora: probar con los datos de mentira no
// deberia costar tener que ir a buscar el JSON del endpoint otra vez.
export interface StoredCatalog {
  source: CatalogSource;
  entries: CatalogEntry[];
}

// Vive fuera del borrador y fuera del export: son datos del simulador, y se comparten entre
// formularios porque el catalogo de departamentos es el mismo en todos.
export type CatalogBank = Record<string, StoredCatalog>;

export interface CatalogParseResult {
  entries: CatalogEntry[];
  error: string | null;
}
