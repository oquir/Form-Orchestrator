import { type ReactNode, useState } from "react";
import { CheckCircle, Copy } from "reicon-react";
import { buildFormExport } from "../../../lib/exportForm/exportForm";
import { useFormStore } from "../../../store/formStore";

// key: color de claves con valor objeto/número/boolean/null
// arrayKey / stringKey: color especial de la clave cuando el valor es un array o un string
// string/emptyString/number/boolean/null: color del valor según su tipo
// punctuation: color de { } [ ] : ,
const COLOR = {
  key: "text-orange-600 dark:text-orange-400",
  arrayKey: "text-emerald-600 dark:text-emerald-300",
  stringKey: "text-pink-600 dark:text-pink-400",
  string: "text-blue-600 dark:text-blue-400",
  emptyString: "text-orange-600 dark:text-orange-400",
  number: "text-cyan-600 dark:text-cyan-300",
  boolean: "text-violet-600 dark:text-violet-400",
  null: "text-slate-500 dark:text-slate-200",
  punctuation: "text-zinc-500 dark:text-zinc-400",
};

function keyColorFor(value: unknown): string {
  if (Array.isArray(value)) return COLOR.arrayKey;
  if (typeof value === "string") return COLOR.stringKey;
  return COLOR.key;
}

function Punct({ children }: { children: ReactNode }) {
  return <span className={COLOR.punctuation}>{children}</span>;
}

function renderPrimitive(value: unknown, nodeKey: string): ReactNode {
  if (typeof value === "string") {
    return (
      <span key={nodeKey} className={value === "" ? COLOR.emptyString : COLOR.string}>
        {JSON.stringify(value)}
      </span>
    );
  }
  if (typeof value === "number") {
    return (
      <span key={nodeKey} className={COLOR.number}>
        {value}
      </span>
    );
  }
  if (typeof value === "boolean") {
    return (
      <span key={nodeKey} className={COLOR.boolean}>
        {value ? "true" : "false"}
      </span>
    );
  }
  return (
    <span key={nodeKey} className={COLOR.null}>
      null
    </span>
  );
}

function renderValue(value: unknown, indent: number, nodeKey: string): ReactNode {
  const pad = "  ".repeat(indent);
  const closePad = "  ".repeat(indent - 1);

  if (Array.isArray(value)) {
    if (value.length === 0) return <Punct key={nodeKey}>[]</Punct>;
    return (
      <span key={nodeKey}>
        <Punct>{"[\n"}</Punct>
        {value.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static read-only JSON render, order never changes
          <span key={`${nodeKey}-${index}`}>
            {pad}
            {renderValue(item, indent + 1, `${nodeKey}-${index}`)}
            <Punct>{index < value.length - 1 ? ",\n" : "\n"}</Punct>
          </span>
        ))}
        {closePad}
        <Punct>]</Punct>
      </span>
    );
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return <Punct key={nodeKey}>{"{}"}</Punct>;
    return (
      <span key={nodeKey}>
        <Punct>{"{\n"}</Punct>
        {entries.map(([key, val], index) => (
          <span key={`${nodeKey}-${key}`}>
            {pad}
            <span className={keyColorFor(val)}>{JSON.stringify(key)}</span>
            <Punct>{": "}</Punct>
            {renderValue(val, indent + 1, `${nodeKey}-${key}`)}
            <Punct>{index < entries.length - 1 ? ",\n" : "\n"}</Punct>
          </span>
        ))}
        {closePad}
        <Punct>{"}"}</Punct>
      </span>
    );
  }

  return renderPrimitive(value, nodeKey);
}

export function JsonPreviewCanvas() {
  const formSteps = useFormStore((state) => state.formSteps);
  const setupConfig = useFormStore((state) => state.setupConfig);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const [copied, setCopied] = useState(false);

  const data = buildFormExport(formSteps, setupConfig, introSteps);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex min-h-[70vh] flex-col gap-3 rounded-lg border-2 border-dashed border-slate-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 dark:text-neutral-500">
          Se actualiza en vivo con cada cambio del formulario.
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-500 hover:cursor-pointer hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {copied ? (
            <>
              <CheckCircle size={12} weight="Filled" className="text-emerald-500" />
              Copiado
            </>
          ) : (
            <>
              <Copy size={12} />
              Copiar
            </>
          )}
        </button>
      </div>

      <pre className="flex-1 overflow-auto rounded-md bg-slate-100 p-2 text-xs leading-relaxed dark:bg-neutral-900">
        <code>{renderValue(data, 1, "root")}</code>
      </pre>
    </div>
  );
}
