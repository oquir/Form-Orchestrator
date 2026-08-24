import type { CSSProperties } from "react";
import { fieldKey } from "../../../../lib/runtimeValidation/runtimeValidation.utils";
import { PreviewField } from "../PreviewField/PreviewField";
import type { PreviewRowsGridProps } from "./PreviewRowsGrid.types";

export function PreviewRowsGrid({
  rows,
  scope,
  preview,
  groupId,
  itemIndex,
}: PreviewRowsGridProps) {
  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => {
        // Una fila sin campos visibles seguiria contando como hijo del flex y dejaria su gap.
        if (!row.fields.some((field) => scope.visible[field.name])) return null;

        return (
          <div
            key={row.rowId}
            className="grid items-start gap-3"
            style={
              {
                // Los estilos de la fila ya llegan resueltos a CSS plano; gridTemplateColumns va
                // al final para que gane sobre un CSS libre que lo nombrara.
                ...row.styles,
                gridTemplateColumns: `repeat(${row.columns}, minmax(0, 1fr))`,
              } as CSSProperties
            }
          >
            {row.fields.map((field) => {
              const key: string = fieldKey(field.name, groupId, itemIndex);

              return (
                <PreviewField
                  key={field.fieldId}
                  field={field}
                  scope={scope}
                  catalogBank={preview.catalogBank}
                  externalLabel={preview.model.externalLabels.get(field.name)}
                  linkedTooltip={
                    field.labelFor
                      ? preview.model.fieldsByName.get(field.labelFor)?.tooltip
                      : undefined
                  }
                  error={preview.revealed[key] ? preview.errors[key] : undefined}
                  onChange={(value) => preview.setValue(field.name, value, groupId, itemIndex)}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
