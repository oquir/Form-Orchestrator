export function toInputValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";

  return String(value);
}

export function toSelectedList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (value === undefined || value === null || value === "") return [];

  return [String(value)];
}

export function toggleInList(list: string[], entry: string): string[] {
  return list.includes(entry) ? list.filter((item) => item !== entry) : [...list, entry];
}
