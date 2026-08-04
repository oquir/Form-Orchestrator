import type { ExportedField } from "../../types/exportForm";
import type { FieldDataSource, FieldOption } from "../../types/field";
import type { RuntimeValues } from "../../types/formRuntime";
import { MOCK_CATALOGS, MOCK_OPTION_COUNT } from "./mockCatalog.constants";

// Un campo mapeado no lleva opciones: las inyecta el consumidor consultando el catalogo.
// Para poder simularlo se generan opciones deterministas a partir de la ruta, salvo cuando
// el campo declara un dataSource, que es la unica pista que el JSON da sobre que catalogo pedir.
export function catalogOptions(field: ExportedField, values: RuntimeValues = {}): FieldOption[] {
  if (field.options && field.options.length > 0) return field.options;

  const source: FieldDataSource | undefined = field.dataSource;

  if (source) {
    // Sin el padre elegido no hay consulta que hacer, igual que en el consumidor real.
    if (source.dependsOn !== undefined) {
      const parent: unknown = values[source.dependsOn];
      if (parent === undefined || parent === null || parent === "") return [];

      const catalog = MOCK_CATALOGS[source.catalog];

      return catalog ? catalog(String(parent)) : placeholderOptions(source.catalog);
    }

    const catalog = MOCK_CATALOGS[source.catalog];

    return catalog ? catalog() : placeholderOptions(source.catalog);
  }

  if (field.apiBinding?.kind !== "mapped") return [];

  return placeholderOptions(field.apiBinding.path.split(".").pop() ?? field.name);
}

// Un catalogo declarado sin datos de mentira igual tiene que dejar llenar el formulario.
function placeholderOptions(prefix: string): FieldOption[] {
  return Array.from({ length: MOCK_OPTION_COUNT }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
    label: `${prefix} ${index + 1}`,
  }));
}

export function isSimulatedCatalog(field: ExportedField): boolean {
  if (field.options && field.options.length > 0) return false;

  return field.dataSource !== undefined || field.apiBinding?.kind === "mapped";
}
