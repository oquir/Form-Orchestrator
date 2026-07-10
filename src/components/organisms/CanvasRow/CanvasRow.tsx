import { useDroppable } from "@dnd-kit/core";
import { Xmark } from "reicon-react";
import { useFormStore } from "../../../store/formStore";
import { IconButton } from "../../atoms/IconButton/IconButton";
import { CanvasFieldChip } from "../../molecules/CanvasFieldChip/CanvasFieldChip";
import type { CanvasRowProps } from "./CanvasRow.types";

export function CanvasRow({ row, onFieldContextMenu }: CanvasRowProps) {
  const { setNodeRef, isOver } = useDroppable({ id: row.id, data: { rowId: row.id } });
  const selectedFieldId = useFormStore((state) => state.selectedFieldId);
  const selectField = useFormStore((state) => state.selectField);
  const removeRow = useFormStore((state) => state.removeRow);

  return (
    <div
      ref={setNodeRef}
      className={`relative col-span-12 grid grid-cols-12 gap-3 rounded-md border-2 border-dashed p-3 transition-colors ${
        isOver
          ? "border-slate-400 bg-slate-50 dark:border-neutral-500 dark:bg-neutral-800/60"
          : "border-slate-200 dark:border-neutral-700"
      }`}
    >
      <IconButton
        onClick={() => removeRow(row.id)}
        title="Eliminar fila"
        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-xs text-slate-400 shadow-sm hover:border-red-300 hover:text-red-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500 dark:hover:border-red-400 dark:hover:text-red-400 hover:cursor-pointer"
      >
        <Xmark size={12} weight="Filled" />
      </IconButton>
      {row.fields.length === 0 && (
        <div className="col-span-12 flex h-24 items-center justify-center text-sm text-slate-300 dark:text-neutral-600">
          Suelta un campo aquí
        </div>
      )}
      {row.fields.map((field) => (
        <CanvasFieldChip
          key={field.id}
          field={field}
          selected={selectedFieldId === field.id}
          onClick={() => selectField(field.id)}
          onContextMenu={(event) => {
            event.preventDefault();
            selectField(field.id);
            onFieldContextMenu(field.id, event.clientX, event.clientY);
          }}
        />
      ))}
    </div>
  );
}
