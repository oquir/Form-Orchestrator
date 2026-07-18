import type { JsonPrimitive } from "../../atoms/JsonPrimitiveValue/JsonPrimitiveValue.types";

/** Cualquier nodo serializable de un árbol JSON (recursivo). */
export type JsonNode = JsonPrimitive | JsonNode[] | { [key: string]: JsonNode };

export interface JsonValueProps {
  value: JsonNode;
  indent: number;
  nodeKey: string;
}
