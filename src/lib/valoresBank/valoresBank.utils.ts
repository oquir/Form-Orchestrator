// Gemelo del findArray de catalogBank, a proposito y no por descuido: los .utils de una carpeta son
// privados de esa carpeta, y importarlo de alla pondria a este banco a depender de las entranias
// del de catalogos. Son ocho lineas y no crecen.
//
// Las APIs suelen envolver la lista en {data: [...]} o {result: [...]}: se busca el primer arreglo
// que traiga el objeto antes de rendirse, porque es lo que uno pega sin pensar.
export function findArray(parsed: unknown): unknown[] | null {
  if (Array.isArray(parsed)) return parsed;
  if (typeof parsed !== "object" || parsed === null) return null;

  for (const value of Object.values(parsed)) {
    if (Array.isArray(value)) return value;
  }

  return null;
}

// Un numero venga como numero o como texto. El endpoint puede mandar 52374 o "52374", y un valor
// que no se puede leer devuelve null para que la fila entera se descarte en vez de guardar un NaN.
//
// La lectura directa va primero y solo si falla se quitan los separadores. Al reves, un "52374.00"
// perfectamente legible se convertiria en 5237400: dos ordenes de magnitud, y en silencio. Que
// "1.750.905" solo llegue al segundo intento es justamente la senal de que ahi el punto agrupa.
export function leerNumero(item: unknown, key: string): number | null {
  if (typeof item !== "object" || item === null) return null;

  const value: unknown = (item as Record<string, unknown>)[key];
  if (value === undefined || value === null || value === "") return null;

  const directo: number = Number(value);
  if (Number.isFinite(directo)) return directo;

  // Se aceptan las dos convenciones de agrupado porque un volcado pegado de una tabla trae la que
  // tenga el sistema de origen. Estos valores son pesos enteros, asi que no hay decimales que
  // proteger: un "1.750,50" saldria mal, pero ni la UVT ni el salario minimo los llevan.
  const limpio: number = Number(String(value).replace(/[.,\s]/g, ""));

  return Number.isFinite(limpio) ? limpio : null;
}
