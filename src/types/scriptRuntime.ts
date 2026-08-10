// `value` es undefined en dos casos que el runtime distingue: el script fallo -- y entonces
// `error` lo cuenta -- o devolvio undefined a proposito, que significa "no toques lo que escribio
// el usuario".
export interface ScriptRunResult {
  value: unknown;
  error: string | null;
}
