export const ARRAY_MARKER = "[]";

interface PathSegment {
  key: string;
  index: number | null;
}

export function parsePath(path: string): PathSegment[] {
  return path
    .split(".")
    .filter((part) => part.length > 0)
    .map((part) => {
      const match: RegExpMatchArray | null = part.match(/^(.*?)\[(\d+)\]$/);

      return match
        ? { key: match[1], index: Number.parseInt(match[2], 10) }
        : { key: part, index: null };
    });
}

export function setDeepValue(target: Record<string, unknown>, path: string, value: unknown): void {
  const segments: PathSegment[] = parsePath(path);
  if (segments.length === 0) return;

  let cursor: Record<string, unknown> = target;

  segments.forEach((segment, position) => {
    const isLast: boolean = position === segments.length - 1;

    if (segment.index === null) {
      if (isLast) {
        cursor[segment.key] = value;
        return;
      }

      if (typeof cursor[segment.key] !== "object" || cursor[segment.key] === null) {
        cursor[segment.key] = {};
      }
      cursor = cursor[segment.key] as Record<string, unknown>;
      return;
    }

    if (!Array.isArray(cursor[segment.key])) cursor[segment.key] = [];
    const list = cursor[segment.key] as Record<string, unknown>[];
    while (list.length <= segment.index) list.push({});

    if (isLast) {
      list[segment.index] = value as Record<string, unknown>;
      return;
    }

    cursor = list[segment.index];
  });
}
