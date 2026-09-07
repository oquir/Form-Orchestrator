import { useRef } from "react";
import { MAX_ROW_COLUMNS, MIN_ROW_COLUMNS } from "../../../constants/grid";
import {
  ROW_TOOLBAR_ITEM_CLASSES,
  ROW_TOOLBAR_POPOVER_CLASSES,
} from "../../../constants/uiClasses";
import { useClickOutside } from "../../../hooks/useClickOutside/useClickOutside";
import { useFormStore } from "../../../store/formStore";
import type { RowColumnsMenuProps } from "./RowColumnsMenu.types";

// El abierto/cerrado lo lleva la barra que lo contiene, no este componente: asi los dos menus son
// excluyentes sin conocerse y la barra sabe que tiene que quedarse a la vista mientras haya uno
// desplegado.
export function RowColumnsMenu({ rowId, columns, isOpen, onToggle, onClose }: RowColumnsMenuProps) {
  const updateRowColumns = useFormStore((state) => state.updateRowColumns);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(containerRef, onClose, isOpen);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        title="Cambiar columnas de la fila"
        className={ROW_TOOLBAR_ITEM_CLASSES}
      >
        {columns} col
      </button>
      {isOpen && (
        <div className={ROW_TOOLBAR_POPOVER_CLASSES}>
          <label htmlFor={`row-columns-${rowId}`} className="text-[11px] font-medium text-fg-muted">
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
              className="w-14 rounded-md border border-border bg-field px-2 py-1 text-sm text-fg outline-none focus:border-brand-border"
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
          <p className="text-[10px] text-fg-subtle">
            Los campos que excedan se ajustan automaticamente.
          </p>
        </div>
      )}
    </div>
  );
}
