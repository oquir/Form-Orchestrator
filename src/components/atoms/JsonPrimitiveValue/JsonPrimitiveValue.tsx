import { JSON_PRIMITIVE_COLOR } from "./JsonPrimitiveValue.constants";
import type { JsonPrimitiveValueProps } from "./JsonPrimitiveValue.types";

export function JsonPrimitiveValue({ value }: JsonPrimitiveValueProps) {
  if (typeof value === "string") {
    return (
      <span
        className={value === "" ? JSON_PRIMITIVE_COLOR.emptyString : JSON_PRIMITIVE_COLOR.string}
      >
        {JSON.stringify(value)}
      </span>
    );
  }
  if (typeof value === "number") {
    return <span className={JSON_PRIMITIVE_COLOR.number}>{value}</span>;
  }
  if (typeof value === "boolean") {
    return <span className={JSON_PRIMITIVE_COLOR.boolean}>{value ? "true" : "false"}</span>;
  }
  return <span className={JSON_PRIMITIVE_COLOR.null}>null</span>;
}
