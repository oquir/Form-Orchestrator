import { CONCEPT_VALUE_KEY } from "../../../../constants/fieldConcept";
import { useApiMappingPanel } from "../../../../hooks/useApiMappingPanel/useApiMappingPanel";
import { isPresentationalField } from "../../../../lib/fieldKind/fieldKind";
import { allowsManualOptions, isOptionBasedField } from "../../../../lib/fieldOptions/fieldOptions";
import type { CanvasField } from "../../../../types/field";
import { ApiPathSelect } from "../../../molecules/ApiPathSelect/ApiPathSelect";
import { LabeledInput } from "../../../molecules/LabeledInput/LabeledInput";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { PayloadDestinationSwitch } from "../../../molecules/PayloadDestinationSwitch/PayloadDestinationSwitch";
import { FieldOptionsModal } from "../../FieldOptionsModal/FieldOptionsModal";
import { FieldDataSourceEditor } from "../FieldDataSourceEditor/FieldDataSourceEditor";
import {
  DESTINATION_DESCRIPTION,
  ERROR_CLASSES,
  HINT_CLASSES,
  NOTE_CLASSES,
  WARNING_CLASSES,
} from "./ApiMappingPanel.constants";

export function ApiMappingPanel({ field }: { field: CanvasField }) {
  const {
    destination,
    disabledDestinations,
    path,
    leaves,
    isOrphan,
    isHostPath,
    showTypeMismatch,
    resolvedType,
    group,
    awaitsGroupArrayPath,
    conceptId,
    conceptKind,
    conceptClash,
    dataSourceCandidates,
    isAskingOptions,
    handleDestinationChange,
    handleOptionsConfirm,
    handleOptionsCancel,
    handlePathChange,
    handleConceptIdChange,
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
      <PanelSection title="Destino en el payload" description={DESTINATION_DESCRIPTION}>
        <PayloadDestinationSwitch
          destination={destination}
          disabledReasons={disabledDestinations}
          onChange={handleDestinationChange}
        />

        {destination === "excluded" && (
          <p className={HINT_CLASSES}>
            Excluido: no se enviará al objeto final aunque participe en cálculos o condiciones.
            {allowsManualOptions(field) &&
              " Si lo pasás a Contrato, las opciones que cargaste se descartan."}
          </p>
        )}

        {destination === "contract" && group !== null && (
          <p className={NOTE_CLASSES}>
            {awaitsGroupArrayPath
              ? `Este campo vive dentro del grupo repetible “${group.title}”. Elegí primero a qué arreglo del payload corresponde el grupo.`
              : `Este campo se envía una vez por cada ${group.title.toLowerCase()}, dentro de ${group.arrayPath}[].`}
          </p>
        )}

        {destination === "contract" && !awaitsGroupArrayPath && (
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

        {destination === "concept" && (
          <>
            <LabeledInput
              id="concept-id"
              label="idConcepto"
              type="number"
              min={1}
              step={1}
              placeholder="Ej. 5"
              value={conceptId ?? ""}
              onChange={(event) => handleConceptIdChange(event.target.value)}
            />

            {conceptKind !== null && (
              <p className={HINT_CLASSES}>
                El id del concepto en la tabla de conceptos del backend. Viaja con tipo{" "}
                <span className="font-semibold">{conceptKind}</span> en{" "}
                <code className="font-mono">{CONCEPT_VALUE_KEY[conceptKind]}</code>.
                {allowsManualOptions(field) &&
                  " Las opciones viajan por su texto; si lo pasás a Contrato, se descartan."}
              </p>
            )}

            {conceptId === undefined && (
              <p className={ERROR_CLASSES}>
                Falta el idConcepto: sin él, el formulario no se puede exportar.
              </p>
            )}

            {conceptClash !== null && (
              <p className={ERROR_CLASSES}>
                El campo “{conceptClash.label}” ya usa el idConcepto {conceptId}: dos conceptos con
                el mismo id se pisarían en el backend.
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
          onCancel={handleOptionsCancel}
        />
      )}
    </div>
  );
}
