import type { JsonPrimitive } from "../../../types/jsonTree";

export interface JsonPrimitiveColor {
  string: string;
  emptyString: string;
  number: string;
  boolean: string;
  null: string;
}

export interface JsonPrimitiveValueProps {
  value: JsonPrimitive;
}
