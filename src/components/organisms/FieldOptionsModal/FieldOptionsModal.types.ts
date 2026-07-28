import type { OptionsSetup } from "../../../types/formStoreTypes";

export interface FieldOptionsModalProps {
  fieldTypeLabel: string;
  onConfirm: (setup: OptionsSetup) => void;
  onCancel: () => void;
}
