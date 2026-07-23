import type { CanvasField, EnableOperator } from "../../types/storeTypes";

export function operatorsForFieldType(type: string): EnableOperator[] {
  switch (type) {
    case "checkbox":
      return ["isTruthy", "isFalsy"];
    case "number":
    case "calculated":
      return ["equals", "notEquals", "greaterThan", "lessThan", "isEmpty", "isNotEmpty"];
    case "select":
    case "toggle_group":
    case "radio_group":
      return ["equals", "notEquals", "isEmpty", "isNotEmpty"];
    case "file":
      return ["isEmpty", "isNotEmpty"];
    default:
      return ["equals", "notEquals", "isEmpty", "isNotEmpty"];
  }
}

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
    const next = byId.get(id)?.enableWhen?.fieldId;
    if (next) stack.push(next);
  }
  return false;
}
