import type { DraftPayload, FieldRename } from "./persistenceTypes";

export type DraftRecoveryStatus = "loading" | "recovering" | "ready";

export interface DraftRecovery {
  status: DraftRecoveryStatus;
  draft: DraftPayload | null;
  // Nombres repetidos que hubo que desambiguar al cargar. El modal los lista para que el autor
  // sepa que formulas revisar.
  renamed: FieldRename[];
  // Habia un borrador y no paso la validacion, asi que se borro y se arranca de cero. Sobrevive
  // hasta que el asistente termina, que es donde se muestra el aviso.
  wasInvalid: boolean;
  restore: () => void;
  discard: () => void;
}
