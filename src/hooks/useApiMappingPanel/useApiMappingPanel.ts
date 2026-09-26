import { useState } from "react";
import { PAYLOAD_SCHEMA } from "../../constants/payloadSchema";
import {
  conceptKindOf,
  conceptOwners,
  isValidConceptId,
  parseConceptId,
} from "../../lib/fieldConcept/fieldConcept";
import { isPresentationalField } from "../../lib/fieldKind/fieldKind";
import { isOptionBasedField } from "../../lib/fieldOptions/fieldOptions";
import { fieldMatchesSchemaType } from "../../lib/payloadMapping/payloadMapping";
import { flattenSelectableLeaves, resolveLeaf } from "../../lib/payloadSchema/payloadSchema";
import { findGroupForField, getAllFields, useFormStore } from "../../store/formStore";
import type { CanvasField } from "../../types/field";
import type { ConceptValueKind } from "../../types/fieldConcept";
import type { OptionsSetup } from "../../types/formStoreTypes";
import type { RepeatableGroup } from "../../types/formStructure";
import type { PayloadDestination } from "../../types/payloadMapping";
import type { SchemaLeaf } from "../../types/payloadSchema";
import { CONCEPT_IN_GROUP_REASON } from "./useApiMappingPanel.constants";
import type {
  UseApiMappingPanelParams,
  UseApiMappingPanelResult,
} from "./useApiMappingPanel.types";
import { destinationOf, offContractBinding } from "./useApiMappingPanel.utils";

export function useApiMappingPanel({ field }: UseApiMappingPanelParams): UseApiMappingPanelResult {
  const updateFieldApiBinding = useFormStore((state) => state.updateFieldApiBinding);
  const formSteps = useFormStore((state) => state.formSteps);
  const introSteps = useFormStore((state) => state.introModal.steps);
  // A que destino iba el campo cuando hubo que pedirle opciones primero.
  const [pendingDestination, setPendingDestination] = useState<"concept" | "excluded" | null>(null);
  const group: RepeatableGroup | null = useFormStore((state) => findGroupForField(state, field.id));
  const binding = field.apiBinding;

  const destination: PayloadDestination = destinationOf(binding);
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

  // Los dos lienzos: un campo del modal de entrada tambien puede ir como concepto, y un id repetido
  // se pisa del otro lado venga de donde venga.
  const allFields: CanvasField[] = getAllFields([
    ...formSteps.flatMap((step) => step.rows),
    ...introSteps.flatMap((step) => step.rows),
  ]);
  // Un id que no sirve -solo llega de un archivo editado a mano- se muestra como faltante, que es
  // lo que la revision de exportacion va a decir de el.
  const conceptId: number | undefined =
    binding?.kind === "concept" && isValidConceptId(binding.idConcepto)
      ? binding.idConcepto
      : undefined;
  const conceptKind: ConceptValueKind | null = conceptKindOf(field.type);
  const conceptClash: CanvasField | null =
    conceptId === undefined
      ? null
      : ((conceptOwners(allFields).get(conceptId) ?? []).find((owner) => owner.id !== field.id) ??
        null);
  const disabledDestinations: Partial<Record<PayloadDestination, string>> =
    group !== null ? { concept: CONCEPT_IN_GROUP_REASON } : {};

  const dataSourceCandidates: CanvasField[] = getAllFields(
    formSteps.flatMap((step) => step.rows),
  ).filter((candidate) => candidate.id !== field.id && !isPresentationalField(candidate.type));

  // Con un catalogo declarado no hay opciones que autorar: salir del contrato deja de arrastrar al
  // modal.
  const needsOptionsSetup: boolean =
    isOptionBasedField(field.type) &&
    (field.options ?? []).length === 0 &&
    field.dataSource === undefined;

  function handleDestinationChange(next: PayloadDestination): void {
    if (next === destination) return;

    if (next === "contract") {
      updateFieldApiBinding(field.id, null);
      return;
    }

    if (needsOptionsSetup) {
      setPendingDestination(next);
      return;
    }

    updateFieldApiBinding(field.id, offContractBinding(next));
  }

  function handleOptionsConfirm(setup: OptionsSetup): void {
    if (pendingDestination !== null) {
      updateFieldApiBinding(field.id, offContractBinding(pendingDestination), setup);
    }
    setPendingDestination(null);
  }

  function handleOptionsCancel(): void {
    setPendingDestination(null);
  }

  function handlePathChange(nextPath: string): void {
    updateFieldApiBinding(field.id, nextPath ? { kind: "mapped", path: nextPath } : null);
  }

  function handleConceptIdChange(raw: string): void {
    updateFieldApiBinding(field.id, { kind: "concept", idConcepto: parseConceptId(raw) });
  }

  return {
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
    isAskingOptions: pendingDestination !== null,
    handleDestinationChange,
    handleOptionsConfirm,
    handleOptionsCancel,
    handlePathChange,
    handleConceptIdChange,
  };
}
