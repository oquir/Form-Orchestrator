import type { CanvasField } from "../../types/field";
import type { ConceptValueKind } from "../../types/fieldConcept";
import type { OptionsSetup } from "../../types/formStoreTypes";
import type { RepeatableGroup } from "../../types/formStructure";
import type { PayloadDestination } from "../../types/payloadMapping";
import type { SchemaLeaf } from "../../types/payloadSchema";

export interface UseApiMappingPanelParams {
  field: CanvasField;
}

export interface UseApiMappingPanelResult {
  destination: PayloadDestination;
  disabledDestinations: Partial<Record<PayloadDestination, string>>;
  path: string;
  leaves: SchemaLeaf[];
  isOrphan: boolean;
  isHostPath: boolean;
  showTypeMismatch: boolean;
  resolvedType: string | null;
  group: RepeatableGroup | null;
  awaitsGroupArrayPath: boolean;
  conceptId: number | undefined;
  conceptKind: ConceptValueKind | null;
  conceptClash: CanvasField | null;
  dataSourceCandidates: CanvasField[];
  isAskingOptions: boolean;
  handleDestinationChange: (destination: PayloadDestination) => void;
  handleOptionsConfirm: (setup: OptionsSetup) => void;
  handleOptionsCancel: () => void;
  handlePathChange: (nextPath: string) => void;
  handleConceptIdChange: (raw: string) => void;
}
