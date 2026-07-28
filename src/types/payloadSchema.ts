export type SchemaNodeType = "string" | "number" | "boolean" | "object" | "array";

export interface SchemaNode {
  key: string;
  type: SchemaNodeType;
  children?: SchemaNode[];
  items?: SchemaNode;
  providedByHost?: boolean;
}

export interface SchemaLeaf {
  path: string;
  type: SchemaNodeType;
  providedByHost?: boolean;
}
