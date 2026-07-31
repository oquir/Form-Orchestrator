import type { SchemaLeaf, SchemaNode, SchemaNodeType } from "../../types/payloadSchema";
import { collectLeaves } from "./payloadSchema.utils";

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
