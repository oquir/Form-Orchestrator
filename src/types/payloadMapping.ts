import type { SchemaNodeType } from "./payloadSchema";

export type LeafBindingStatus =
  | { kind: "unmapped" }
  | { kind: "host"; conflictingFieldLabel?: string }
  | { kind: "mapped"; fieldId: string; fieldLabel: string; typeMismatch: boolean };

export type MappingNode =
  | { kind: "object"; key: string; children: MappingNode[] }
  | { kind: "array"; key: string; item?: MappingNode }
  | { kind: "leaf"; key: string; schemaType: SchemaNodeType; binding: LeafBindingStatus };

// Los tres destinos que ofrece el panel Mapeo API. "contract" cubre el campo mapeado y el que
// todavia no eligio hoja: los dos van al contrato, solo que uno aun no dice a donde.
export type PayloadDestination = "contract" | "concept" | "excluded";

export interface OrphanBinding {
  fieldId: string;
  fieldLabel: string;
  path: string;
}
