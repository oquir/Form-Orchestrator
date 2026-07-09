import type { ReactNode } from "react";

export function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-slate-900 px-3 py-2 text-xs text-slate-100 dark:bg-slate-950">
      <code>{children}</code>
    </pre>
  );
}
