import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { CSSProperties } from "react";
import { resolveRowStyles } from "../../../lib/cssStyles/cssStyles";
import { useFormStore } from "../../../store/formStore";
import { CanvasFieldChip } from "../../molecules/CanvasFieldChip/CanvasFieldChip";
import { RowZoneOverlay } from "../../molecules/RowZoneOverlay/RowZoneOverlay";
import { RowToolbar } from "../RowToolbar/RowToolbar";
import type { CanvasRowProps } from "./CanvasRow.types";
import { getRowBorderClasses } from "./CanvasRow.utils";

export function CanvasRow({ row, linkedLabels, offsetY = 0, onFieldContextMenu }: CanvasRowProps) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: row.id, data: { rowId: row.id } });
  const {
    listeners,
    attributes,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({ id: row.id, data: { source: "canvas-row", row } });
  const selectedFieldId = useFormStore((state) => state.selectedFieldId);
  const selectField = useFormStore((state) => state.selectField);
  const dragPlacement = useFormStore((state) => state.dragPlacement);
  const rowDropTarget = useFormStore((state) => state.rowDropTarget);
  const isRowDragActive = useFormStore((state) => state.rowDrag !== null);
  const zonePlacement = dragPlacement?.rowId === row.id ? dragPlacement : null;
  // El hueco que se abre ya dice donde va a caer, asi que la linea solo hace falta para avisar de
  // que ahi no puede ir: una fila de un grupo intentando salirse de el.
  const rejected = rowDropTarget?.rowId === row.id && !rowDropTarget.isValid;
  // La fila que contiene el campo seleccionado se queda con su marco y su barra a la vista, sin
  // hover: es el camino que le queda a quien navega con el teclado o desde una pantalla tactil.
  const pinned: boolean = row.fields.some((field) => field.id === selectedFieldId);

  function setRefs(node: HTMLLIElement | null): void {
    setDropRef(node);
    setDragRef(node);
  }

  return (
    <li
      ref={setRefs}
      data-canvas-row=""
      data-row-id={row.id}
      style={
        {
          // Lo estructural va al final para que gane: si el CSS libre del autor nombrara
          // grid-template-columns o transform no puede pisar lo que controla el sistema de filas.
          ...resolveRowStyles(row.styles),
          gridTemplateColumns: `repeat(${row.columns}, minmax(0, 1fr))`,
          transform: offsetY === 0 ? undefined : `translateY(${offsetY}px)`,
        } as CSSProperties
      }
      // La clase de transicion depende del mismo estado que el transform, asi que al soltar las dos
      // desaparecen en el mismo commit: el navegador no tiene que animar la vuelta a cero y la fila
      // no pega el salto de deshacer el desplazamiento que ya se convirtio en su sitio real.
      className={`group/row relative col-span-16 grid gap-3 rounded-md border-2 p-3 ${
        isRowDragActive
          ? "transition-transform duration-200 ease-[cubic-bezier(0.34,1.6,0.5,1)]"
          : "transition-colors"
      } ${
        // Invisible y no atenuada: las vecinas se corren justo su alto y pasarian por encima de un
        // fantasma. El hueco que queda es la propia fila, que ahora vuela con el cursor.
        isDragging ? "opacity-0" : ""
      } ${getRowBorderClasses({ isOver, isEmpty: row.fields.length === 0, pinned })}`}
    >
      <RowToolbar row={row} listeners={listeners} attributes={attributes} pinned={pinned} />

      {rejected && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 z-20 h-1 rounded-full bg-red-500 dark:bg-red-400 ${
            rowDropTarget.edge === "before" ? "-top-2" : "-bottom-2"
          }`}
        />
      )}

      {row.fields.length === 0 && (
        <div
          style={{ gridColumn: `span ${row.columns} / span ${row.columns}` }}
          className="flex h-24 items-center justify-center text-sm text-slate-300 dark:text-neutral-600"
        >
          Suelta un campo aquí
        </div>
      )}

      {row.fields.map((field) => (
        <CanvasFieldChip
          key={field.id}
          field={field}
          rowId={row.id}
          rowColumns={row.columns}
          rowFields={row.fields}
          linkedLabel={linkedLabels.get(field.id) ?? null}
          selected={selectedFieldId === field.id}
          onClick={() => selectField(field.id)}
          onContextMenu={(event) => {
            event.preventDefault();
            selectField(field.id);
            onFieldContextMenu(field.id, event.clientX, event.clientY);
          }}
        />
      ))}
      {zonePlacement && <RowZoneOverlay columns={row.columns} placement={zonePlacement} />}
    </li>
  );
}
