import { isPresentationalField } from "../../../../lib/fieldKind/fieldKind";
import { isSimulatedCatalog } from "../../../../lib/mockCatalog/mockCatalog";
import { isRequiredBySchema } from "../../../../lib/runtimeValidation/runtimeValidation.utils";
import { PreviewTooltip } from "../../../molecules/PreviewTooltip/PreviewTooltip";
import { PreviewFieldControl } from "../PreviewFieldControl/PreviewFieldControl";
import type { PreviewFieldProps } from "./PreviewField.types";

export function PreviewField({
  field,
  scope,
  externalLabel,
  linkedTooltip,
  error,
  onChange,
}: PreviewFieldProps) {
  // Precedencia del contrato: si visibleWhen da falso el campo no se dibuja ni se valida.
  if (!scope.visible[field.name]) return null;

  const style = { gridColumn: `${field.colStart} / span ${field.colSpan}` };

  if (field.type === "label") {
    return (
      <div style={style} className="flex min-w-0 items-center gap-1 self-end pb-1.5">
        <label
          htmlFor={field.labelFor ? `preview-${field.labelFor}` : undefined}
          className="text-sm font-medium text-fg"
        >
          {field.label}
        </label>
        {linkedTooltip && <PreviewTooltip tooltip={linkedTooltip} label={field.label} />}
      </div>
    );
  }

  if (isPresentationalField(field.type)) {
    return (
      <div style={style} className="min-w-0">
        <PreviewFieldControl
          field={field}
          value={undefined}
          disabled
          invalid={false}
          scopeValues={scope.values}
          onChange={onChange}
        />
      </div>
    );
  }

  const computed: boolean = Boolean(scope.computed[field.name]);
  const disabled: boolean = scope.disabled[field.name] || computed;
  const showLabel: boolean = externalLabel === undefined;

  return (
    <div style={style} className="flex min-w-0 flex-col gap-1">
      {showLabel && (
        <div className="flex items-center gap-1">
          <label htmlFor={`preview-${field.name}`} className="text-xs font-medium text-fg-soft">
            {field.label}
            {isRequiredBySchema(field) && <span className="ml-0.5 text-danger">*</span>}
          </label>
          {field.tooltip && <PreviewTooltip tooltip={field.tooltip} label={field.label} />}
        </div>
      )}

      <PreviewFieldControl
        field={field}
        value={scope.values[field.name]}
        disabled={disabled}
        invalid={Boolean(error)}
        scopeValues={scope.values}
        onChange={onChange}
      />

      <div className="flex flex-wrap items-center gap-2">
        {error && <span className="text-[11px] text-danger">{error}</span>}
        {computed && <span className="text-[11px] text-fg-subtle">Calculado</span>}
        {isSimulatedCatalog(field) && (
          <span className="text-[11px] text-fg-subtle">Catálogo simulado</span>
        )}
      </div>
    </div>
  );
}
