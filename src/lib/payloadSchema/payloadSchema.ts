import type { SchemaLeaf, SchemaNode, SchemaNodeType } from "../../types/payloadSchema";

function collectLeaves(
  node: SchemaNode,
  path: string,
  out: SchemaLeaf[],
  arrayPath: string | undefined,
): void {
  if (node.type === "object") {
    for (const child of node.children ?? []) {
      const childPath = path ? `${path}.${child.key}` : child.key;
      collectLeaves(child, childPath, out, arrayPath);
    }

    return;
  }

  if (node.type === "array") {
    if (node.items) collectLeaves(node.items, `${path}[]`, out, path);

    return;
  }

  out.push({ path, type: node.type, providedByHost: node.providedByHost, arrayPath });
}

export function flattenLeaves(schema: SchemaNode): SchemaLeaf[] {
  const leaves: SchemaLeaf[] = [];
  collectLeaves(schema, "", leaves, undefined);

  return leaves;
}

export function flattenSelectableLeaves(schema: SchemaNode, arrayPath?: string): SchemaLeaf[] {
  return flattenLeaves(schema).filter(
    (leaf) => !leaf.providedByHost && leaf.arrayPath === arrayPath,
  );
}

export function arrayPaths(schema: SchemaNode): string[] {
  const paths: string[] = [];

  for (const leaf of flattenLeaves(schema)) {
    if (leaf.arrayPath !== undefined && !paths.includes(leaf.arrayPath)) paths.push(leaf.arrayPath);
  }

  return paths;
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
