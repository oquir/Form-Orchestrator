export function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;

  return false;
}

export function isTruthyValue(value: unknown): boolean {
  if (typeof value === "string") return value !== "" && value !== "false" && value !== "0";
  if (Array.isArray(value)) return value.length > 0;

  return Boolean(value);
}

export function toComparableText(value: unknown): string {
  if (value === undefined || value === null) return "";

  return String(value);
}

export function looseEquals(left: unknown, right: unknown): boolean {
  if (typeof left === "boolean" || typeof right === "boolean") {
    return isTruthyValue(left) === isTruthyValue(right);
  }

  return toComparableText(left) === toComparableText(right);
}

export function toConditionList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(toComparableText);
  if (value === undefined || value === null) return [];

  return toComparableText(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}
