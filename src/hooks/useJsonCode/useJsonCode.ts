import { useCallback, useMemo, useState } from "react";
import { buildJsonModel, computeVisibleRows } from "../../lib/jsonCode/jsonCode";
import type { JsonModel, JsonVisibleRow } from "../../types/jsonCode";

export interface UseJsonCodeResult {
  rows: JsonVisibleRow[];
  toggle: (lineIndex: number) => void;
}

export function useJsonCode(json: string): UseJsonCodeResult {
  const model: JsonModel = useMemo(() => buildJsonModel(json), [json]);
  const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set());

  const toggle = useCallback((lineIndex: number): void => {
    setCollapsed((prev) => {
      const next: Set<number> = new Set(prev);
      if (next.has(lineIndex)) {
        next.delete(lineIndex);
      } else {
        next.add(lineIndex);
      }
      return next;
    });
  }, []);

  const rows: JsonVisibleRow[] = useMemo(
    () => computeVisibleRows(model, collapsed),
    [model, collapsed],
  );

  return { rows, toggle };
}
