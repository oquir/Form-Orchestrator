import { fieldMatchesSchemaType } from "../../../../lib/payloadMapping/payloadMapping";
import { flattenLeaves, resolveLeafType } from "../../../../lib/payloadSchema/payloadSchema";
import { PAYLOAD_SCHEMA } from "../../../../lib/payloadSchema/payloadSchema.constants";
import type { SchemaLeaf } from "../../../../lib/payloadSchema/payloadSchema.types";
import { useFormStore } from "../../../../store/formStore";
import type { CanvasField } from "../../../../types/storeTypes";
import { Checkbox } from "../../../atoms/Checkbox/Checkbox";
import { ApiPathSelect } from "../../../molecules/ApiPathSelect/ApiPathSelect";

export function ApiMappingPanel({ field }: { field: CanvasField }) {
  const updateFieldApiBinding = useFormStore((state) => state.updateFieldApiBinding);
  const binding = field.apiBinding;
  const isExcluded = binding?.kind === "excluded";
  const path = binding?.kind === "mapped" ? binding.path : "";
  const leaves: SchemaLeaf[] = flattenLeaves(PAYLOAD_SCHEMA);
  const resolvedType = path ? resolveLeafType(PAYLOAD_SCHEMA, path) : null;
  const isOrphan = Boolean(path) && resolvedType === null;
  const showTypeMismatch = Boolean(
    resolvedType && !fieldMatchesSchemaType(field.type, resolvedType),
  );

  function handleExcludedToggle(checked: boolean): void {
    updateFieldApiBinding(field.id, checked ? { kind: "excluded" } : null);
  }

  function handlePathChange(nextPath: string): void {
    updateFieldApiBinding(field.id, nextPath ? { kind: "mapped", path: nextPath } : null);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* biome-ignore lint/a11y/noLabelWithoutControl: Checkbox renders a nested <input type="checkbox"> */}
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-neutral-200">
        <Checkbox
          checked={isExcluded}
          onChange={(event) => handleExcludedToggle(event.target.checked)}
        />
        Excluir del payload (uso interno del formulario)
      </label>

      {isExcluded && (
        <p className="text-[11px] text-slate-400 dark:text-neutral-500">
          Este campo no se enviará al objeto final aunque participe en cálculos o condiciones.
        </p>
      )}

      {!isExcluded && (
        <>
          <ApiPathSelect
            path={path}
            leaves={leaves}
            isOrphan={isOrphan}
            onChange={handlePathChange}
          />

          {isOrphan && (
            <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
              Esta ruta ya no existe en el objeto de la API. Reasigná o excluí el campo.
            </p>
          )}

          {showTypeMismatch && (
            <p className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400">
              El tipo del campo ({field.type}) no coincide con el tipo esperado en la API (
              {resolvedType}).
            </p>
          )}
        </>
      )}
    </div>
  );
}
