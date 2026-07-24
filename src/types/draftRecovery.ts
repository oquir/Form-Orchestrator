import type { DraftPayload } from "./persistenceTypes";

export type DraftRecoveryStatus = "loading" | "recovering" | "ready";

export interface DraftRecovery {
  status: DraftRecoveryStatus;
  draft: DraftPayload | null | undefined;
  restore: () => void;
  discard: () => void;
}
