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
      {rows.map((row) => (
        <div
          key={row.rowId}
          className="grid items-start gap-3"
          style={{ gridTemplateColumns: `repeat(${row.columns}, minmax(0, 1fr))` }}
        >
          {row.fields.map((field) => {
            const key: string = fieldKey(field.name, groupId, itemIndex);

            return (
              <PreviewField
                key={field.fieldId}
                field={field}
                scope={scope}
                externalLabel={preview.model.externalLabels.get(field.name)}
                linkedTooltip={
                  field.labelFor
                    ? preview.model.fieldsByName.get(field.labelFor)?.tooltip
                    : undefined
                }
                error={preview.showErrors ? preview.errors[key] : undefined}
                onChange={(value) => preview.setValue(field.name, value, groupId, itemIndex)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
