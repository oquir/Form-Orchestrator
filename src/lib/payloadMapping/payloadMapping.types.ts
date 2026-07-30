import type { SchemaNodeType } from "../../types/payloadSchema";

export type LeafBindingStatus =
  | { kind: "unmapped" }
  | { kind: "host"; conflictingFieldLabel?: string }
  | { kind: "mapped"; fieldId: string; fieldLabel: string; typeMismatch: boolean };

export type MappingNode =
  | { kind: "object"; key: string; children: MappingNode[] }
  | { kind: "array"; key: string; item?: MappingNode }
  | { kind: "leaf"; key: string; schemaType: SchemaNodeType; binding: LeafBindingStatus };

export interface OrphanBinding {
  fieldId: string;
  fieldLabel: string;
  path: string;
}
