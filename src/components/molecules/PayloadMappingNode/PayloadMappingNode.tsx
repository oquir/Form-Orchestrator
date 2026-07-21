import { JsonPunctuation } from "../../atoms/JsonPunctuation/JsonPunctuation";
import type { PayloadMappingNodeProps } from "./PayloadMappingNode.types";

export function PayloadMappingNode({ node, indent }: PayloadMappingNodeProps) {
  const pad: string = "  ".repeat(indent);
  const closePad: string = "  ".repeat(indent - 1);

  if (node.kind === "object") {
    if (node.children.length === 0) return <JsonPunctuation>{"{}"}</JsonPunctuation>;
    return (
      <span>
        <JsonPunctuation>{"{\n"}</JsonPunctuation>
        {node.children.map((child, index) => (
          <span key={`${node.key}-${child.key}`}>
            {pad}
            <span className="text-sky-600 dark:text-sky-400">{JSON.stringify(child.key)}</span>
            <JsonPunctuation>{": "}</JsonPunctuation>
            <PayloadMappingNode node={child} indent={indent + 1} />
            <JsonPunctuation>{index < node.children.length - 1 ? ",\n" : "\n"}</JsonPunctuation>
          </span>
        ))}
        {closePad}
        <JsonPunctuation>{"}"}</JsonPunctuation>
      </span>
    );
  }

  if (node.kind === "array") {
    return (
      <span className="text-slate-400 dark:text-neutral-500">
        <JsonPunctuation>{"[]"}</JsonPunctuation>{" "}
        <span className="italic">grupo repetible — pendiente</span>
      </span>
    );
  }

  if (node.binding.kind === "unmapped") {
    return <span className="italic text-red-500 dark:text-red-400">— sin mapear —</span>;
  }

  return (
    <span
      className={
        node.binding.typeMismatch
          ? "text-amber-600 dark:text-amber-400"
          : "text-emerald-600 dark:text-emerald-400"
      }
    >
      ← {node.binding.fieldLabel}
      {node.binding.typeMismatch && " ⚠"}
    </span>
  );
}
