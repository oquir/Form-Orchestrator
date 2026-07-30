import type { SchemaLeaf } from "../../../types/payloadSchema";

export function groupLeavesByRoot(leaves: SchemaLeaf[]): Map<string, SchemaLeaf[]> {
  const groups: Map<string, SchemaLeaf[]> = new Map();

  for (const leaf of leaves) {
    const groupKey = leaf.path.split(".")[0];
    const existing = groups.get(groupKey);

    if (existing) {
      existing.push(leaf);
    } else {
      groups.set(groupKey, [leaf]);
    }
  }

  return groups;
}
