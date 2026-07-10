import type { DraftPayload } from "../../../types/persistenceTypes";

export interface DraftRecoveryModalProps {
  draft: DraftPayload;
  onRestore: () => void;
  onDiscard: () => void;
}
