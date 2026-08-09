import { FieldTypeBadge } from "../../atoms/FieldTypeBadge/FieldTypeBadge";
import { FieldPreviewControl } from "../FieldPreviewControl/FieldPreviewControl";
import type { RowDragPreviewProps } from "./RowDragPreview.types";

// Replica de la fila, no un chip: se dibuja al ancho real que se midio al empezar el arrastre para
// que uno vea que lleva la seccion entera. Es una copia simplificada a proposito -sin tirador, sin
// menu de columnas, sin redimensionar- porque nada de eso se puede usar mientras vuela.
export function RowDragPreview({ row, width }: RowDragPreviewProps) {
  return (
    <div
      style={{ width, gridTemplateColumns: `repeat(${row.columns}, minmax(0, 1fr))` }}
      className="grid rotate-1 gap-3 rounded-md border-2 border-orange-500 bg-white p-3 shadow-2xl dark:border-orange-400 dark:bg-neutral-900"
    >
      {row.fields.length === 0 && (
        <div
          style={{ gridColumn: `span ${row.columns} / span ${row.columns}` }}
          className="flex h-16 items-center justify-center text-sm text-slate-300 dark:text-neutral-600"
        >
          Fila vacía
        </div>
      )}

      {row.fields.map((field) => (
        <div
          key={field.id}
          style={{
            gridColumn: `${field.colStart} / span ${field.colSpan}`,
            marginTop: field.styles.marginTop,
            marginBottom: field.styles.marginBottom,
            backgroundColor: field.styles.backgroundColor,
            color: field.styles.textColor,
          }}
          className="flex min-w-0 flex-col gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
        >
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <p className="truncate text-sm font-medium text-slate-700 dark:text-neutral-200">
              {field.label}
            </p>
            <FieldTypeBadge type={field.type} />
          </div>
          <FieldPreviewControl field={field} />
        </div>
      ))}
    </div>
  );
}
