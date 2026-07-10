import type { DraftPayload } from "../../lib/persistence";

export interface DraftRecoveryModalProps {
  draft: DraftPayload;
  onRestore: () => void;
  onDiscard: () => void;
}
