export interface TopologicalResult {
  order: string[];
  unresolved: string[];
  cycle: string[] | null;
}
