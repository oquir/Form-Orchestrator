import type { CanvasField } from "../../types/field";
import type { JsonNode } from "../../types/jsonTree";
import type { SchemaNode, SchemaNodeType } from "../../types/payloadSchema";
import { resolveLeafType } from "../payloadSchema/payloadSchema";
import type { LeafBindingStatus, MappingNode, OrphanBinding } from "./payloadMapping.types";

const NUMERIC_FIELD_TYPES: string[] = ["number", "calculated"];

export function fieldMatchesSchemaType(fieldType: string, schemaType: SchemaNodeType): boolean {
  switch (schemaType) {
    case "number":
      return NUMERIC_FIELD_TYPES.includes(fieldType) || fieldType === "checkbox";
    case "boolean":
      return fieldType === "checkbox";
    case "string":
      return !NUMERIC_FIELD_TYPES.includes(fieldType);
    default:
      return true;
  }
}

function buildPathIndex(fields: CanvasField[]): Map<string, CanvasField> {
  const index: Map<string, CanvasField> = new Map();

  for (const field of fields) {
    if (field.apiBinding?.kind === "mapped") {
      index.set(field.apiBinding.path, field);
    }
  }

  return index;
}

function buildNode(node: SchemaNode, path: string, index: Map<string, CanvasField>): MappingNode {
  if (node.type === "object") {
    const children: MappingNode[] = (node.children ?? []).map((child) => {
      const childPath: string = path ? `${path}.${child.key}` : child.key;
      return buildNode(child, childPath, index);
    });

    return { kind: "object", key: node.key, children };
  }

  if (node.type === "array") {
    return { kind: "array", key: node.key };
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

export function buildMappingTree(schema: SchemaNode, fields: CanvasField[]): MappingNode {
  const index: Map<string, CanvasField> = buildPathIndex(fields);
  return buildNode(schema, "", index);
}

export function toPlainSummary(node: MappingNode): JsonNode {
  if (node.kind === "object") {
    const result: { [key: string]: JsonNode } = {};

    for (const child of node.children) {
      result[child.key] = toPlainSummary(child);
    }

    return result;
  }

  if (node.kind === "array") {
    return "— grupo repetible (pendiente) —";
  }

  if (node.binding.kind === "unmapped") {
    return "— sin mapear —";
  }

  if (node.binding.kind === "host") {
    return node.binding.conflictingFieldLabel
      ? `⚠ lo define el aplicativo receptor (${node.binding.conflictingFieldLabel} apunta acá)`
      : "— lo define el aplicativo receptor —";
  }

  return node.binding.typeMismatch
    ? `← ${node.binding.fieldLabel} (⚠ tipo)`
    : `← ${node.binding.fieldLabel}`;
}

export function findOrphanBindings(schema: SchemaNode, fields: CanvasField[]): OrphanBinding[] {
  const orphans: OrphanBinding[] = [];

  for (const field of fields) {
    if (field.apiBinding?.kind !== "mapped") continue;

    const resolved: SchemaNodeType | null = resolveLeafType(schema, field.apiBinding.path);

    if (resolved === null) {
      orphans.push({ fieldId: field.id, fieldLabel: field.label, path: field.apiBinding.path });
    }
  }

  return orphans;
}
