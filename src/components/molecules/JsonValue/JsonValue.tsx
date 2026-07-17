import { JsonKey } from "../../atoms/JsonKey/JsonKey";
import { JsonPrimitiveValue } from "../../atoms/JsonPrimitiveValue/JsonPrimitiveValue";
import { JsonPunctuation } from "../../atoms/JsonPunctuation/JsonPunctuation";

export function JsonValue({
  value,
  indent,
  nodeKey,
}: {
  value: unknown;
  indent: number;
  nodeKey: string;
}) {
  const pad = "  ".repeat(indent);
  const closePad = "  ".repeat(indent - 1);

  if (Array.isArray(value)) {
    if (value.length === 0) return <JsonPunctuation>[]</JsonPunctuation>;
    return (
      <span>
        <JsonPunctuation>{"[\n"}</JsonPunctuation>
        {value.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static read-only JSON render, order never changes
          <span key={`${nodeKey}-${index}`}>
            {pad}
            <JsonValue value={item} indent={indent + 1} nodeKey={`${nodeKey}-${index}`} />
            <JsonPunctuation>{index < value.length - 1 ? ",\n" : "\n"}</JsonPunctuation>
          </span>
        ))}
        {closePad}
        <JsonPunctuation>]</JsonPunctuation>
      </span>
    );
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return <JsonPunctuation>{"{}"}</JsonPunctuation>;
    return (
      <span>
        <JsonPunctuation>{"{\n"}</JsonPunctuation>
        {entries.map(([key, val], index) => (
          <span key={`${nodeKey}-${key}`}>
            {pad}
            <JsonKey name={key} value={val} />
            <JsonPunctuation>{": "}</JsonPunctuation>
            <JsonValue value={val} indent={indent + 1} nodeKey={`${nodeKey}-${key}`} />
            <JsonPunctuation>{index < entries.length - 1 ? ",\n" : "\n"}</JsonPunctuation>
          </span>
        ))}
        {closePad}
        <JsonPunctuation>{"}"}</JsonPunctuation>
      </span>
    );
  }

  return <JsonPrimitiveValue value={value as string | number | boolean | null} />;
}
