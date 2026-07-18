export interface JsonPrimitiveColor {
  string: string;
  emptyString: string;
  number: string;
  boolean: string;
  null: string;
}

/** Hoja primitiva de un árbol JSON. */
export type JsonPrimitive = string | number | boolean | null;

export interface JsonPrimitiveValueProps {
  value: JsonPrimitive;
}
