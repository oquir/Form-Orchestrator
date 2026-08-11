import type { CatalogOption } from "../../types/catalog";
import type { ExportedField } from "../../types/exportForm";
import type { CatalogFill } from "../../types/field";
import type { RuntimeValues } from "../../types/formRuntime";

// Copia columnas de la opcion elegida a otros campos. Es lo que hace que al elegir una actividad
// se llenen solos su codigo CIIU y su tarifa: campos de solo lectura que muestran datos del
// catalogo, no cosas que alguien tipee.
//
// La declaracion viaja en el export, asi que el consumidor hace exactamente esto con la respuesta
// de su propio endpoint. La unica diferencia es de donde salen las opciones: aca del banco de
// catalogos o de los datos de mentira, alla de la API.

export function hasFills(field: ExportedField): boolean {
  return (field.dataSource?.fills?.length ?? 0) > 0;
}

// Devuelve los valores a escribir, indexados por nombre de campo. Quien llama los mezcla en el
// ambito que corresponda -- la fila del grupo, no el root -- porque esta funcion no sabe ni tiene
// por que saber en que repeticion esta parada.
export function resolveFills(
  field: ExportedField,
  selected: unknown,
  options: CatalogOption[],
): RuntimeValues {
  const fills: CatalogFill[] | undefined = field.dataSource?.fills;
  if (!fills || fills.length === 0) return {};

  const empty: boolean = selected === undefined || selected === null || selected === "";
  const option: CatalogOption | undefined = empty
    ? undefined
    : options.find((candidate) => candidate.id === String(selected));

  const values: RuntimeValues = {};

  // Sin opcion elegida, o con una columna que el catalogo no trae, el destino se vacia. Dejarle
  // la tarifa de la actividad anterior es peor que no mostrar nada: el impuesto se seguiria
  // calculando con ella y el numero pareceria correcto.
  for (const fill of fills) {
    const value: unknown = option?.[fill.column];
    values[fill.field] = value === undefined ? "" : value;
  }

  return values;
}
