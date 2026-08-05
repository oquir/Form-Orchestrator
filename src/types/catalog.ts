import type { FieldOption } from "./field";

export interface CatalogDefinition {
  id: string;
  label: string;
  // Un catalogo parametrizado no devuelve nada mientras no se elija el campo padre.
  requiresParent?: boolean;
}

// Las columnas que el endpoint devuelve ademas del id y la etiqueta. No viajan en el export: el
// consumidor las recibe de su propio endpoint, aca solo se replica lo que ese endpoint ya da. El
// buscador las dibuja en su propia columna en vez de amontonarlas dentro de la etiqueta.
export interface CatalogOption extends FieldOption {
  // Codigo con el que el contribuyente reconoce la opcion, distinto del id tecnico: en actividades
  // el id es idDeclaracion y el codigo es el CIIU, y la plantilla los lleva en campos separados.
  code?: string;
  // Tarifa por mil. Hoy solo la trae actividades.
  tarifa?: number;
}

export interface CatalogEntry extends CatalogOption {
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

// Como se llaman en el volcado las columnas que interesan. Van juntas en un objeto porque ya son
// cinco y cuatro de ellas opcionales: como parametros sueltos habria que contar posiciones.
export interface CatalogPasteKeys {
  id: string;
  label: string;
  parent?: string;
  code?: string;
  tarifa?: string;
}
