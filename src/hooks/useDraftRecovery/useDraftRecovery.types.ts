import type { DraftPayload, FieldRename } from "../../types/persistenceTypes";

export interface PendingDraft {
  draft: DraftPayload | null;
  renamed: FieldRename[];
  wasInvalid: boolean;
}
