import { useEffect, useRef, useState } from "react";
import { useFormStore } from "../../../store/formStore";
import { MAX_ROW_COLUMNS, MIN_ROW_COLUMNS } from "./RowColumnsMenu.constants";
import type { RowColumnsMenuProps } from "./RowColumnsMenu.types";

export function RowColumnsMenu({ rowId, columns }: RowColumnsMenuProps) {
  const updateRowColumns = useFormStore((state) => state.updateRowColumns);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="absolute -left-2 -top-2 z-10">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        title="Cambiar columnas de la fila"
        className="flex h-5 items-center justify-center rounded-full border border-slate-200 bg-white px-2 text-[10px] font-medium text-slate-500 shadow-sm hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-orange-500 dark:hover:text-orange-400 hover:cursor-pointer"
      >
        {columns} col
      </button>
      {isOpen && (
        <div className="absolute left-0 top-6 flex w-72 flex-col gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          <label
            htmlFor={`row-columns-${rowId}`}
            className="text-[11px] font-medium text-slate-600 dark:text-neutral-300"
          >
            Columnas de la fila
          </label>
          <div className="flex items-center gap-2">
            <input
              id={`row-columns-${rowId}`}
              type="number"
              min={MIN_ROW_COLUMNS}
              max={MAX_ROW_COLUMNS}
              value={columns}
              onChange={(event) => {
                const parsed = Number.parseInt(event.target.value, 10);
                if (Number.isNaN(parsed)) return;
                updateRowColumns(rowId, parsed);
              }}
              className="w-14 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-orange-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            />
            <input
              type="range"
              min={MIN_ROW_COLUMNS}
              max={MAX_ROW_COLUMNS}
              value={columns}
              onChange={(event) => updateRowColumns(rowId, Number.parseInt(event.target.value, 10))}
              className="flex-1 accent-orange-500 cursor-grab active:cursor-grabbing"
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-neutral-500">
            Los campos que excedan se ajustan automaticamente.
          </p>
        </div>
      )}
    </div>
  );
}
