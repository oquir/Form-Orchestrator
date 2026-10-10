// Lo minimo para decidir el placeholder, estructural para que entren CanvasField y ExportedField
// sin que esta carpeta conozca ninguno.
export interface PlaceholderField {
  type: string;
  placeholder?: string;
}
