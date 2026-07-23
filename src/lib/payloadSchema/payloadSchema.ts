import type { SchemaNode, SchemaNodeType } from "../../types/payloadSchema";
import type { SchemaLeaf } from "./payloadSchema.types";

function collectLeaves(node: SchemaNode, path: string, out: SchemaLeaf[]): void {
  if (node.type === "object") {
    for (const child of node.children ?? []) {
      const childPath = path ? `${path}.${child.key}` : child.key;
      collectLeaves(child, childPath, out);
    }
    return;
  }

  if (node.type === "array") return;
  out.push({ path, type: node.type });
}

export function flattenLeaves(schema: SchemaNode): SchemaLeaf[] {
  const leaves: SchemaLeaf[] = [];
  collectLeaves(schema, "", leaves);
  return leaves;
}

export function resolveLeafType(schema: SchemaNode, path: string): SchemaNodeType | null {
  const leaf: SchemaLeaf | undefined = flattenLeaves(schema).find(
    (candidate) => candidate.path === path,
  );
  return leaf ? leaf.type : null;
}
