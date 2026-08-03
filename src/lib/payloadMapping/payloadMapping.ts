import type { CanvasField } from "../../types/field";
import type { JsonNode } from "../../types/jsonTree";
import type { MappingNode, OrphanBinding } from "../../types/payloadMapping";
import type { SchemaNode, SchemaNodeType } from "../../types/payloadSchema";
import { resolveLeafType } from "../payloadSchema/payloadSchema";
import { NUMERIC_FIELD_TYPES } from "./payloadMapping.constants";
import { buildNode, buildPathIndex } from "./payloadMapping.utils";

// Cruza el contrato de la API con lo que el usuario mapeo, para poder mostrar la cobertura y
// avisar de desajustes de tipo, rutas huerfanas y hojas que pone el host.

export function fieldMatchesSchemaType(fieldType: string, schemaType: SchemaNodeType): boolean {
  switch (schemaType) {
    case "number":
      // El checkbox cuenta como numero porque el contrato no tiene booleanos: se mapea a 0 o 1.
      // Sin esta excepcion cualquier checkbox mapeado mostraria un aviso de tipo imposible de
      // quitar. Los selects contra hojas numericas siguen avisando: es un hueco conocido.
      return NUMERIC_FIELD_TYPES.includes(fieldType) || fieldType === "checkbox";
    case "boolean":
      return fieldType === "checkbox";
    case "string":
      return !NUMERIC_FIELD_TYPES.includes(fieldType);
    default:
      return true;
  }
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
    return node.item ? [toPlainSummary(node.item)] : "— grupo repetible —";
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
