import type { ReglaAnio } from "../../types/maxDates";

// Una regla por ano y por declaracion: es lo que buscan fechaLimite y la edicion de una fecha, y el
// ano es la key de React de cada fila. Si el endpoint repite un ano se queda la primera.
export function primeraReglaPorAnio(reglas: ReglaAnio[]): ReglaAnio[] {
  const anios = new Set<number>();

  return reglas.filter((regla) => {
    if (anios.has(regla.anio)) return false;

    anios.add(regla.anio);
    return true;
  });
}

// Los endpoints suelen envolver la respuesta en {success, result: {...}} o {data: {...}}, que es lo
// que ya se vio en los volcados de catalogos. Se prueba el objeto tal cual y despues cada una de
// sus propiedades que sea objeto, porque es lo que uno pega sin pensar.
export function candidateObjects(parsed: unknown): unknown[] {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return [];

  const candidates: unknown[] = [parsed];

  for (const value of Object.values(parsed)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value))
      candidates.push(value);
  }

  return candidates;
}
