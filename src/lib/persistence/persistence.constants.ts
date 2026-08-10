export const DRAFT_KEY: string = "form-orchestrator-draft";

// Version de la forma del borrador. Sube cada vez que el store cambia de shape de manera que un
// borrador viejo dejaria de validar, y por cada subida va un paso en persistence.migrations.
//   1: sin version, todo lo anterior al preludio.
//   2: aparece formScript.
//   3: logic.formula se convierte en logic.script.
export const DRAFT_SCHEMA_VERSION: number = 3;
