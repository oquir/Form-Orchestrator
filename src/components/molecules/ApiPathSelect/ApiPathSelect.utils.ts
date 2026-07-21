import type { SchemaLeaf } from "../../../lib/payloadSchema/payloadSchema.types";

export function groupLeavesByRoot(leaves: SchemaLeaf[]): Map<string, SchemaLeaf[]> {
  const groups: Map<string, SchemaLeaf[]> = new Map();
  for (const leaf of leaves) {
    const groupKey: string = leaf.path.split(".")[0];
    const existing: SchemaLeaf[] | undefined = groups.get(groupKey);
    if (existing) {
      existing.push(leaf);
    } else {
      groups.set(groupKey, [leaf]);
    }
  }
  return groups;
}
