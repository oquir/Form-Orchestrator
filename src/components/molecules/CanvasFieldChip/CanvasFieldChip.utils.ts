export function getChipPaddingClasses(isCompact: boolean, isUltraCompact: boolean): string {
  if (isUltraCompact) return "pl-1 pr-1";
  if (isCompact) return "pl-6 pr-5";
  return "pl-8 pr-8";
}
