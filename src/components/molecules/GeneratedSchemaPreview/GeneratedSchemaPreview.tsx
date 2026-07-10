import { CodeBlock } from "../../atoms/CodeBlock/CodeBlock";

export function GeneratedSchemaPreview({ schema }: { schema: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-slate-500 dark:text-neutral-400">
        Esquema Zod generado
      </p>
      <CodeBlock>{schema}</CodeBlock>
    </div>
  );
}
