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
