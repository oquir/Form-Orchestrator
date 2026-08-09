import { useState } from "react";
import { PAYLOAD_SCHEMA } from "../../../../constants/payloadSchema";
import { isPresentationalField } from "../../../../lib/fieldKind/fieldKind";
import { allowsManualOptions, isOptionBasedField } from "../../../../lib/fieldOptions/fieldOptions";
import { fieldMatchesSchemaType } from "../../../../lib/payloadMapping/payloadMapping";
import { flattenSelectableLeaves, resolveLeaf } from "../../../../lib/payloadSchema/payloadSchema";
import { findGroupForField, getAllFields, useFormStore } from "../../../../store/formStore";
import type { CanvasField } from "../../../../types/field";
import type { OptionsSetup } from "../../../../types/formStoreTypes";
import type { RepeatableGroup } from "../../../../types/formStructure";
import type { SchemaLeaf } from "../../../../types/payloadSchema";
import { ToggleSwitch } from "../../../atoms/ToggleSwitch/ToggleSwitch";
import { ApiPathSelect } from "../../../molecules/ApiPathSelect/ApiPathSelect";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { FieldOptionsModal } from "../../FieldOptionsModal/FieldOptionsModal";
import { FieldDataSourceEditor } from "../FieldDataSourceEditor/FieldDataSourceEditor";
import {
  ERROR_CLASSES,
  HINT_CLASSES,
  NOTE_CLASSES,
  WARNING_CLASSES,
} from "./ApiMappingPanel.constants";

export function ApiMappingPanel({ field }: { field: CanvasField }) {
  const updateFieldApiBinding = useFormStore((state) => state.updateFieldApiBinding);
  const formSteps = useFormStore((state) => state.formSteps);
  const [isAskingOptions, setIsAskingOptions] = useState<boolean>(false);
  const group: RepeatableGroup | null = useFormStore((state) => findGroupForField(state, field.id));
  const binding = field.apiBinding;

  if (isPresentationalField(field.type)) {
    return (
      <p className="text-xs text-fg-subtle">
        Este campo solo muestra contenido: no envía ningún valor, así que no se mapea al payload.
      </p>
    );
  }

  const isExcluded = binding?.kind === "excluded";
  const path = binding?.kind === "mapped" ? binding.path : "";
  const awaitsGroupArrayPath: boolean = group !== null && group.arrayPath === undefined;
  const leaves: SchemaLeaf[] = awaitsGroupArrayPath
    ? []
    : flattenSelectableLeaves(PAYLOAD_SCHEMA, group?.arrayPath);
  const resolvedLeaf: SchemaLeaf | null = path ? resolveLeaf(PAYLOAD_SCHEMA, path) : null;
  const resolvedType = resolvedLeaf?.type ?? null;
  const isOrphan = Boolean(path) && resolvedLeaf === null;
  const isHostPath = Boolean(resolvedLeaf?.providedByHost);
  const showTypeMismatch = Boolean(
    resolvedType && !isHostPath && !fieldMatchesSchemaType(field.type, resolvedType),
  );

  const dataSourceCandidates: CanvasField[] = getAllFields(
    formSteps.flatMap((step) => step.rows),
  ).filter((candidate) => candidate.id !== field.id && !isPresentationalField(candidate.type));

  // Con un catalogo declarado no hay opciones que autorar: excluir deja de arrastrar al modal.
  const needsOptionsSetup: boolean =
    isOptionBasedField(field.type) &&
    (field.options ?? []).length === 0 &&
    field.dataSource === undefined;

  function handleExcludedToggle(checked: boolean): void {
    if (checked && needsOptionsSetup) {
      setIsAskingOptions(true);
      return;
    }
    updateFieldApiBinding(field.id, checked ? { kind: "excluded" } : null);
  }

  function handleOptionsConfirm(setup: OptionsSetup): void {
    updateFieldApiBinding(field.id, { kind: "excluded" }, setup);
    setIsAskingOptions(false);
  }

  function handlePathChange(nextPath: string): void {
    updateFieldApiBinding(field.id, nextPath ? { kind: "mapped", path: nextPath } : null);
  }

  return (
    <div className="flex flex-col gap-3">
      <PanelSection
        title="Destino en el payload"
        aside={
          <ToggleSwitch
            checked={isExcluded}
            onChange={handleExcludedToggle}
            label="Excluir el campo del payload"
          />
        }
      >
        <p className={HINT_CLASSES}>
          {isExcluded ? (
            <>
              Excluido: no se enviará al objeto final aunque participe en cálculos o condiciones.
              {allowsManualOptions(field) &&
                " Si lo volvés a incluir, las opciones que cargaste se descartan."}
            </>
          ) : (
            "Apagá el interruptor de la derecha solo si el campo es de uso interno del formulario y no viaja a la API."
          )}
        </p>

        {!isExcluded && group !== null && (
          <p className={NOTE_CLASSES}>
            {awaitsGroupArrayPath
              ? `Este campo vive dentro del grupo repetible “${group.title}”. Elegí primero a qué arreglo del payload corresponde el grupo.`
              : `Este campo se envía una vez por cada ${group.title.toLowerCase()}, dentro de ${group.arrayPath}[].`}
          </p>
        )}

        {!isExcluded && !awaitsGroupArrayPath && (
          <>
            <ApiPathSelect
              path={path}
              leaves={leaves}
              isOrphan={isOrphan}
              isHostPath={isHostPath}
              onChange={handlePathChange}
            />

            {isHostPath && (
              <p className={ERROR_CLASSES}>
                Esta ruta la define el aplicativo que recibe el JSON, no el formulario. Reasigná o
                excluí el campo.
              </p>
            )}

            {isOrphan && (
              <p className={ERROR_CLASSES}>
                Esta ruta ya no existe en el objeto de la API. Reasigná o excluí el campo.
              </p>
            )}

            {showTypeMismatch && (
              <p className={WARNING_CLASSES}>
                El tipo del campo ({field.type}) no coincide con el tipo esperado en la API (
                {resolvedType}).
              </p>
            )}
          </>
        )}
      </PanelSection>

      {isOptionBasedField(field.type) && (
        <FieldDataSourceEditor field={field} candidates={dataSourceCandidates} />
      )}

      {isAskingOptions && (
        <FieldOptionsModal
          fieldTypeLabel={field.label}
          onConfirm={handleOptionsConfirm}
          onCancel={() => setIsAskingOptions(false)}
        />
      )}
    </div>
  );
}
