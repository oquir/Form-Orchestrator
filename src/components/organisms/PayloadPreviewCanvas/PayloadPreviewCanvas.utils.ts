export function colorClassForSummaryValue(value: string): string {
  if (value === "— sin mapear —") return "text-red-500 dark:text-red-400";

  if (value === "— grupo repetible (pendiente) —") {
    return "italic text-slate-400 dark:text-neutral-500";
  }

  if (value.startsWith("←") && value.includes("(⚠ tipo)")) {
    return "text-amber-600 dark:text-amber-400";
  }

  if (value.startsWith("←")) return "text-emerald-600 dark:text-emerald-400";

  return "";
}
