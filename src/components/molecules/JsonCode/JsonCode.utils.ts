import type { JsonSegment } from "../../../types/jsonCode";
import { JSON_TOKEN_CLASSES } from "./JsonCode.constants";

export function decodeString(quoted: string): string {
  try {
    return JSON.parse(quoted) as string;
  } catch {
    return quoted;
  }
}

export function segmentClass(
  segment: Exclude<JsonSegment, string>,
  valueClassName?: (rawValue: string) => string | undefined,
): string {
  if (segment.kind === "string" && valueClassName) {
    const custom: string | undefined = valueClassName(decodeString(segment.text));
    if (custom && custom.length > 0) return custom;
  }

  return JSON_TOKEN_CLASSES[segment.kind];
}
