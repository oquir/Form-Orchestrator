import type { ExportedField } from "../../types/exportForm";
import type { FieldOption } from "../../types/field";
import { MOCK_OPTION_COUNT } from "./mockCatalog.constants";

// Un campo mapeado no lleva opciones: las inyecta el consumidor consultando el catalogo.
// Para poder simularlo se generan opciones deterministas a partir de la ruta.
export function catalogOptions(field: ExportedField): FieldOption[] {
  if (field.options && field.options.length > 0) return field.options;
  if (field.apiBinding?.kind !== "mapped") return [];

  const leaf: string = field.apiBinding.path.split(".").pop() ?? field.name;

  return Array.from({ length: MOCK_OPTION_COUNT }, (_, index) => ({
    id: `${leaf}-${index + 1}`,
    label: `${leaf} ${index + 1}`,
  }));
}

export function isSimulatedCatalog(field: ExportedField): boolean {
  return (!field.options || field.options.length === 0) && field.apiBinding?.kind === "mapped";
}
