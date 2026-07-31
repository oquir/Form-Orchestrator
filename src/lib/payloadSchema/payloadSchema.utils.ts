import type { SchemaLeaf, SchemaNode } from "../../types/payloadSchema";

export function collectLeaves(
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
