export interface CatalogDefinition {
  id: string;
  label: string;
  // Un catalogo parametrizado no devuelve nada mientras no se elija el campo padre.
  requiresParent?: boolean;
}
