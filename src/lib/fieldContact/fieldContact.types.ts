import type { PhoneKind } from "../../types/fieldContact";

// Lo minimo para decidir el formato de fabrica, estructural para que entren CanvasField y
// ExportedField sin que esta carpeta conozca ninguno.
export interface ContactField {
  type: string;
  phoneKind?: PhoneKind;
}
