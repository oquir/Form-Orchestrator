import { JSON_KEY_COLOR } from "./JsonKey.constants";

export function colorForKeyValue(value: unknown): string {
  if (Array.isArray(value)) return JSON_KEY_COLOR.array;
  if (typeof value === "string") return JSON_KEY_COLOR.string;
  return JSON_KEY_COLOR.default;
}
