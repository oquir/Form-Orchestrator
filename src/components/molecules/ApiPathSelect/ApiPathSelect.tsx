import type { SchemaLeaf } from "../../../lib/payloadSchema/payloadSchema.types";
import type { ApiPathSelectProps } from "./ApiPathSelect.types";
import { groupLeavesByRoot } from "./ApiPathSelect.utils";

export function ApiPathSelect({ path, leaves, isOrphan, onChange }: ApiPathSelectProps) {
  const groups: Map<string, SchemaLeaf[]> = groupLeavesByRoot(leaves);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-slate-500 dark:text-neutral-400">
        Ruta en el objeto de la API
      </span>
      <select
        value={path}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-orange-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
      >
        {!path && <option value="">— Selecciona una ruta —</option>}
        {isOrphan && <option value={path}>(ruta eliminada — reasignar)</option>}
        {Array.from(groups.entries()).map(([groupKey, groupLeaves]) => (
          <optgroup key={groupKey} label={groupKey}>
            {groupLeaves.map((leaf) => (
              <option key={leaf.path} value={leaf.path}>
                {leaf.path}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
