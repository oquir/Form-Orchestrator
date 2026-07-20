import type { RowZoneOverlayProps } from "./RowZoneOverlay.types";

export function RowZoneOverlay({ columns, placement }: RowZoneOverlayProps) {
  const zones: number[] = Array.from({ length: columns }, (_, index) => index + 1);
  const gridTemplateColumns: string = `repeat(${columns}, minmax(0, 1fr))`;
  const label: string = placement.isValid
    ? `${placement.colStart} → ${placement.colStart + placement.colSpan - 1} · ${placement.colSpan} col`
    : "Sin espacio";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-3 z-20">
      <div style={{ gridTemplateColumns }} className="absolute inset-0 grid gap-3">
        {zones.map((zone) => (
          <div
            key={zone}
            className="rounded-sm border border-dashed border-slate-300/80 bg-slate-100/50 dark:border-neutral-600/80 dark:bg-neutral-700/30"
          />
        ))}
      </div>

      <div style={{ gridTemplateColumns }} className="absolute inset-0 grid gap-3">
        <div
          style={{ gridColumn: `${placement.colStart} / span ${placement.colSpan}` }}
          className={`flex items-center justify-center rounded-md border-2 shadow-lg ${
            placement.isValid
              ? "border-orange-500 bg-orange-400/30 dark:border-orange-400 dark:bg-orange-400/25"
              : "border-red-500 bg-red-400/30 dark:border-red-400 dark:bg-red-400/25"
          }`}
        >
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${
              placement.isValid
                ? "bg-orange-500 text-white dark:bg-orange-400 dark:text-neutral-900"
                : "bg-red-500 text-white dark:bg-red-400 dark:text-neutral-900"
            }`}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
