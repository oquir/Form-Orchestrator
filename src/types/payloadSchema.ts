export type SchemaNodeType = "string" | "number" | "boolean" | "object" | "array";

export interface SchemaNode {
  key: string;
  type: SchemaNodeType;
  children?: SchemaNode[];
  items?: SchemaNode;
}

export interface SchemaLeaf {
  path: string;
  type: SchemaNodeType;
}
