import { useApiMappingPanel } from "../../../../hooks/useApiMappingPanel/useApiMappingPanel";
import { isPresentationalField } from "../../../../lib/fieldKind/fieldKind";
import { allowsManualOptions, isOptionBasedField } from "../../../../lib/fieldOptions/fieldOptions";
import type { CanvasField } from "../../../../types/field";
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
  const {
    isExcluded,
    path,
    leaves,
    isOrphan,
    isHostPath,
    showTypeMismatch,
    resolvedType,
    group,
    awaitsGroupArrayPath,
    dataSourceCandidates,
    isAskingOptions,
    setIsAskingOptions,
    handleExcludedToggle,
    handleOptionsConfirm,
    handlePathChange,
  } = useApiMappingPanel({ field });

  if (isPresentationalField(field.type)) {
    return (
      <p className="text-xs text-fg-subtle">
        Este campo solo muestra contenido: no envía ningún valor, así que no se mapea al payload.
      </p>
    );
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
