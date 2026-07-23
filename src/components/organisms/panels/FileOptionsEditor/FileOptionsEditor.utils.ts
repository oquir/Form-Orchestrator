export function togglePreset(current: string[], tokens: string[]): string[] {
  const isActive = tokens.every((token) => current.includes(token));
  if (isActive) return current.filter((token) => !tokens.includes(token));
  const missing = tokens.filter((token) => !current.includes(token));
  return [...current, ...missing];
}
