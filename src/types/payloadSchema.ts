export type SchemaNodeType = "string" | "number" | "boolean" | "object" | "array";

export interface SchemaNode {
  key: string;
  type: SchemaNodeType;
  children?: SchemaNode[];
  items?: SchemaNode;
}
