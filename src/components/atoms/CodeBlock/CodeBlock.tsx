import type { ReactNode } from "react";

// Se ajusta en varias lineas en vez de desbordar: el esquema Zod de un campo con regex es largo y
// dentro del sidebar una barra horizontal obliga a arrastrar para leer la mitad que importa.
export function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-slate-900 px-3 py-2 font-mono text-xs leading-relaxed text-emerald-300 dark:bg-neutral-950">
      <code>{children}</code>
    </pre>
  );
}
