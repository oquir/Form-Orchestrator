import type { CanvasField } from "../../types/field";

export function wouldCreateCycle(
  currentFieldId: string,
  targetFieldId: string,
  allFields: CanvasField[],
): boolean {
  const byId = new Map(allFields.map((f) => [f.id, f]));
  const visited = new Set<string>();
  const stack = [targetFieldId];

  while (stack.length > 0) {
    const id = stack.pop() as string;
    if (id === currentFieldId) return true;
    if (visited.has(id)) continue;
    visited.add(id);
    const observed = byId.get(id);
    if (observed?.enableWhen) stack.push(observed.enableWhen.fieldId);
    if (observed?.visibleWhen) stack.push(observed.visibleWhen.fieldId);
  }
  return false;
}
