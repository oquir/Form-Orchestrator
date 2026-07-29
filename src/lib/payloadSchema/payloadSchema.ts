import type { SchemaLeaf, SchemaNode, SchemaNodeType } from "../../types/payloadSchema";

function collectLeaves(node: SchemaNode, path: string, out: SchemaLeaf[]): void {
  if (node.type === "object") {
    for (const child of node.children ?? []) {
      const childPath = path ? `${path}.${child.key}` : child.key;
      collectLeaves(child, childPath, out);
    }

    return;
  }

  if (node.type === "array") return;
  out.push({ path, type: node.type, providedByHost: node.providedByHost });
}

export function flattenLeaves(schema: SchemaNode): SchemaLeaf[] {
  const leaves: SchemaLeaf[] = [];
  collectLeaves(schema, "", leaves);

  return leaves;
}

export function flattenSelectableLeaves(schema: SchemaNode): SchemaLeaf[] {
  return flattenLeaves(schema).filter((leaf) => !leaf.providedByHost);
}

export function resolveLeaf(schema: SchemaNode, path: string): SchemaLeaf | null {
  const leaf: SchemaLeaf | undefined = flattenLeaves(schema).find(
    (candidate) => candidate.path === path,
  );

  return leaf ?? null;
}

export function resolveLeafType(schema: SchemaNode, path: string): SchemaNodeType | null {
  const leaf: SchemaLeaf | null = resolveLeaf(schema, path);
  return leaf ? leaf.type : null;
}
