import type { ReactNode } from "react";

export function TwoColumnFieldGroup({
  children,
  legend,
}: {
  children: ReactNode;
  legend?: string;
}) {
  if (!legend) {
    return <div className="grid grid-cols-2 gap-2">{children}</div>;
  }

  return (
    <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
      <legend className="mb-0.5 p-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
        {legend}
      </legend>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </fieldset>
  );
}
