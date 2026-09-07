import type { RepeatableGroup } from "../../../types/formStructure";

// Lo que la banda decia con tres inputs y un select desplegados todo el tiempo, dicho en una linea.
// Los numeros son los mismos; lo que cambia es que ahora se leen en vez de editarse por accidente.
export function buildGroupSummary(group: RepeatableGroup): string {
  const activeChecks: number = (group.checks ?? []).filter((check) => check.enabled).length;

  const parts: (string | null)[] = [
    `${group.min}–${group.max} repeticiones`,
    group.arrayPath ? `${group.arrayPath}[]` : "sin mapear",
    activeChecks > 0 ? `${activeChecks} comprobación${activeChecks === 1 ? "" : "es"}` : null,
  ];

  return parts.filter((part): part is string => part !== null).join(" · ");
}
