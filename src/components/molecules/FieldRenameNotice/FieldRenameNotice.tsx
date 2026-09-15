import type { FieldRenameNoticeProps } from "./FieldRenameNotice.types";

export function FieldRenameNotice({ renamed, className = "" }: FieldRenameNoticeProps) {
  if (renamed.length === 0) return null;

  return (
    <div
      className={`rounded border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/40 dark:bg-amber-500/10 ${className}`}
    >
      <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300">
        {renamed.length === 1
          ? "Se corrigió 1 nombre técnico repetido."
          : `Se corrigieron ${renamed.length} nombres técnicos repetidos.`}
      </p>
      <ul className="mt-1 flex flex-col gap-0.5">
        {renamed.map((rename) => (
          <li
            key={`${rename.from}-${rename.to}`}
            className="text-[11px] text-amber-700 dark:text-amber-400"
          >
            <code>{rename.from}</code> → <code>{rename.to}</code> ({rename.label})
          </li>
        ))}
      </ul>
      <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
        Revisa las fórmulas y condiciones que los usen: seguían apuntando al nombre viejo.
      </p>
    </div>
  );
}
