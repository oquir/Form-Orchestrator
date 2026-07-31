import type { CanvasField } from "../../types/field";
import type { SchemaNode } from "../../types/payloadSchema";
import { fieldMatchesSchemaType } from "./payloadMapping";
import type { LeafBindingStatus, MappingNode } from "./payloadMapping.types";

export function buildPathIndex(fields: CanvasField[]): Map<string, CanvasField> {
  const index: Map<string, CanvasField> = new Map();

  for (const field of fields) {
    if (field.apiBinding?.kind === "mapped") {
      index.set(field.apiBinding.path, field);
    }
  }

  return index;
}

export function buildNode(
  node: SchemaNode,
  path: string,
  index: Map<string, CanvasField>,
): MappingNode {
  if (node.type === "object") {
    const children: MappingNode[] = (node.children ?? []).map((child) => {
      const childPath: string = path ? `${path}.${child.key}` : child.key;
      return buildNode(child, childPath, index);
    });

    return { kind: "object", key: node.key, children };
  }

  if (node.type === "array") {
    const item: MappingNode | undefined = node.items
      ? buildNode(node.items, `${path}[]`, index)
      : undefined;

    return { kind: "array", key: node.key, item };
  }

  const matchedField: CanvasField | undefined = index.get(path);

  if (node.providedByHost) {
    const binding: LeafBindingStatus = {
      kind: "host",
      conflictingFieldLabel: matchedField?.label,
    };

    return { kind: "leaf", key: node.key, schemaType: node.type, binding };
  }

  const binding: LeafBindingStatus = matchedField
    ? {
        kind: "mapped",
        fieldId: matchedField.id,
        fieldLabel: matchedField.label,
        typeMismatch: !fieldMatchesSchemaType(matchedField.type, node.type),
      }
    : { kind: "unmapped" };

  return { kind: "leaf", key: node.key, schemaType: node.type, binding };
}
