import { NUMERIC_FIELD_TYPES } from "../../constants/fieldTypes";
import type { CanvasField } from "../../types/field";
import type { LeafBindingStatus, MappingNode } from "../../types/payloadMapping";
import type { SchemaNode, SchemaNodeType } from "../../types/payloadSchema";

// Vive aca y no en payloadMapping.ts porque buildNode la necesita; ese archivo la reexporta para
// quien la pida desde afuera, asi el ciclo de imports queda en un solo sentido.
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
