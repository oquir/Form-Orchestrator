import { v4 as uuidv4 } from "uuid";
import type { GroupCheck } from "../../types/groupCheck";

// Comprobaciones que abarcan un grupo repetible entero, en su forma declarativa: crear una y
// decidir cuales cuentan. Nada de ejecutarlas.
//
// Esa division no es estetica. El exportador necesita filtrar las encendidas, y el exportador vive
// del lado del builder; si desde aca se importara el evaluador, exportar arrastraria el runtime del
// simulador al chunk inicial. Ejecutar una comprobacion es cosa de runtimeValidation, que ya esta
// del otro lado de la frontera.

export function createGroupCheck(): GroupCheck {
  return { id: uuidv4(), label: "", enabled: true, script: "", message: "" };
}

export function enabledChecks(checks: GroupCheck[] | undefined): GroupCheck[] {
  return (checks ?? []).filter((check) => check.enabled && check.script.trim().length > 0);
}

export function hasChecks(checks: GroupCheck[] | undefined): boolean {
  return (checks?.length ?? 0) > 0;
}
