import type { CatalogFill, FieldDataSource } from "../../types/field";

// Al borrar el campo padre se pierde el filtro, no el catalogo: municipio sigue siendo municipio
// aunque ya no haya departamento que lo parametrice. Lo mismo con un destino de relleno: se cae
// esa relacion sola, no las demas ni el catalogo.
export function pruneDataSourceReferencing(
  dataSource: FieldDataSource | undefined,
  fieldId: string,
): FieldDataSource | undefined {
  if (!dataSource) return dataSource;

  const fills: CatalogFill[] | undefined = dataSource.fills?.filter(
    (fill) => fill.field !== fieldId,
  );
  const lostParent: boolean = dataSource.dependsOn === fieldId;
  const lostFill: boolean = fills !== undefined && fills.length !== dataSource.fills?.length;
  if (!lostParent && !lostFill) return dataSource;

  return {
    catalog: dataSource.catalog,
    dependsOn: lostParent ? undefined : dataSource.dependsOn,
    fills: fills && fills.length > 0 ? fills : undefined,
  };
}
