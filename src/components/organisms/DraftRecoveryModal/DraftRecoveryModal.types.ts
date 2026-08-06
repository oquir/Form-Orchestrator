import type { DraftPayload, FieldRename } from "../../../types/persistenceTypes";

export interface DraftRecoveryModalProps {
  draft: DraftPayload;
  renamed: FieldRename[];
  onRestore: () => void;
  onDiscard: () => void;
}
