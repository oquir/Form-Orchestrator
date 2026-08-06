import type { PendingDraft } from "./useDraftRecovery.types";

// Constante a nivel de modulo y no un literal en cada setPending: el hook devuelve `renamed`
// directo al componente, y un arreglo nuevo en cada render vuelve inestable cualquier dependencia
// que lo mire.
export const NOTHING_PENDING: PendingDraft = { draft: null, renamed: [], wasInvalid: false };
