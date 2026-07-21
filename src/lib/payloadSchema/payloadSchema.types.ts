import type { SchemaNodeType } from "../../types/payloadSchema";

export interface SchemaLeaf {
  path: string;
  type: SchemaNodeType;
}
