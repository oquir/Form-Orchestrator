import type { CatalogBank } from "../../types/catalog";
import type { ExportedField } from "../../types/exportForm";
import type { FieldDataSource, FieldOption } from "../../types/field";
import type { RuntimeValues } from "../../types/formRuntime";
import { catalogEntriesFor, usesCustomCatalog } from "../catalogBank/catalogBank";
import { isOptionBasedField } from "../fieldOptions/fieldOptions";
import { MOCK_BY_LEAF, MOCK_CATALOGS, MOCK_OPTION_COUNT } from "./mockCatalog.constants";

// Un campo mapeado no lleva opciones: las inyecta el consumidor consultando el catalogo.
// Para poder simularlo se generan opciones deterministas a partir de la ruta, salvo cuando
// el campo declara un dataSource, que es la unica pista que el JSON da sobre que catalogo pedir.
export function catalogOptions(
  field: ExportedField,
  values: RuntimeValues = {},
  bank: CatalogBank = {},
): FieldOption[] {
  if (field.options && field.options.length > 0) return field.options;

  const source: FieldDataSource | undefined = field.dataSource;

  if (source) {
    // Sin el padre elegido no hay consulta que hacer, igual que en el consumidor real.
    if (source.dependsOn !== undefined) {
      const parent: unknown = values[source.dependsOn];
      if (parent === undefined || parent === null || parent === "") return [];

      return fromCatalog(source.catalog, bank, String(parent));
    }

    return fromCatalog(source.catalog, bank);
  }

  // Sin dataSource el consumidor infiere el catalogo de la ruta, asi que el simulador hace igual.
  if (field.apiBinding?.kind === "mapped") {
    const leaf: string = field.apiBinding.path.split(".").pop() ?? field.name;

    return MOCK_BY_LEAF[leaf] ?? placeholderOptions(leaf);
  }

  // Ni catalogo ni ruta: no hay de donde sacar opciones. Aun asi se inventan, porque un select
  // vacio y obligatorio deja el formulario sin salida y eso no se puede ni probar ni reportar.
  // El unico vacio legitimo es el de arriba: esperar a que elijan el campo padre.
  return placeholderOptions(field.name);
}

// Lo que el autor cargo en el banco manda: si el catalogo esta activo se usa entero, aunque el
// filtro por padre no devuelva nada. Mezclarlo con el dato de mentira daria listas incoherentes.
function fromCatalog(catalogId: string, bank: CatalogBank, parentId?: string): FieldOption[] {
  if (usesCustomCatalog(bank, catalogId)) {
    return catalogEntriesFor(bank, catalogId, parentId).map((entry) => ({
      id: entry.id,
      label: entry.label,
    }));
  }

  const catalog = MOCK_CATALOGS[catalogId];

  return catalog ? catalog(parentId) : placeholderOptions(catalogId);
}

// Un catalogo declarado sin datos de mentira igual tiene que dejar llenar el formulario.
function placeholderOptions(prefix: string): FieldOption[] {
  return Array.from({ length: MOCK_OPTION_COUNT }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
    label: `${prefix} ${index + 1}`,
  }));
}

// Solo un campo de opciones puede tener catalogo: un texto mapeado no lo tiene, aunque comparta
// la ruta. Ni las opciones autoradas ni las cargadas en el banco son simuladas: alguien las puso.
export function isSimulatedCatalog(field: ExportedField, bank: CatalogBank = {}): boolean {
  if (!isOptionBasedField(field.type)) return false;
  if (field.options && field.options.length > 0) return false;
  if (field.dataSource && usesCustomCatalog(bank, field.dataSource.catalog)) return false;

  return true;
}
