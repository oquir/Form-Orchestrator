import type { CanvasField } from "../../types/field";
import type { OptionsSetup } from "../../types/formStoreTypes";
import type { RepeatableGroup } from "../../types/formStructure";
import type { SchemaLeaf } from "../../types/payloadSchema";

export interface UseApiMappingPanelParams {
  field: CanvasField;
}

export interface UseApiMappingPanelResult {
  isExcluded: boolean;
  path: string;
  leaves: SchemaLeaf[];
  isOrphan: boolean;
  isHostPath: boolean;
  showTypeMismatch: boolean;
  resolvedType: string | null;
  group: RepeatableGroup | null;
  awaitsGroupArrayPath: boolean;
  dataSourceCandidates: CanvasField[];
  isAskingOptions: boolean;
  setIsAskingOptions: (value: boolean) => void;
  handleExcludedToggle: (checked: boolean) => void;
  handleOptionsConfirm: (setup: OptionsSetup) => void;
  handlePathChange: (nextPath: string) => void;
}
