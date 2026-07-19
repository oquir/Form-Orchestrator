export function togglePreset(current: string[], tokens: string[]): string[] {
  const isActive: boolean = tokens.every((token) => current.includes(token));
  if (isActive) return current.filter((token) => !tokens.includes(token));
  const missing: string[] = tokens.filter((token) => !current.includes(token));
  return [...current, ...missing];
}
