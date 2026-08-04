import type { FieldDataSource } from "../../types/field";

// Al borrar el campo padre se pierde el filtro, no el catalogo: municipio sigue siendo municipio
// aunque ya no haya departamento que lo parametrice.
export function pruneDataSourceReferencing(
  dataSource: FieldDataSource | undefined,
  fieldId: string,
): FieldDataSource | undefined {
  if (!dataSource || dataSource.dependsOn !== fieldId) return dataSource;

  return { catalog: dataSource.catalog };
}
