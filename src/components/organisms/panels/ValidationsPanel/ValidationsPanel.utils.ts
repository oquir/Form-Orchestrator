export function toNumberOrUndefined(value: string): number | undefined {
  return value === "" ? undefined : Number(value);
}
