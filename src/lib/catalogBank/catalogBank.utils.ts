// Las APIs suelen envolver la lista en {data: [...]} o {content: [...]}: se busca el primer
// arreglo que traiga el objeto antes de rendirse, porque es lo que uno pega sin pensar.
export function findArray(parsed: unknown): unknown[] | null {
  if (Array.isArray(parsed)) return parsed;
  if (typeof parsed !== "object" || parsed === null) return null;

  for (const value of Object.values(parsed)) {
    if (Array.isArray(value)) return value;
  }

  return null;
}

export function readKey(item: unknown, key: string): string | undefined {
  if (typeof item !== "object" || item === null) return undefined;

  const value: unknown = (item as Record<string, unknown>)[key];
  if (value === undefined || value === null || value === "") return undefined;

  return String(value);
}
