import type { CanvasField } from "../../types/field";

export interface FieldGraph {
  nodes: string[];
  edges: Map<string, string[]>;
  byId: Map<string, CanvasField>;
  byName: Map<string, string>;
}

export interface TopologicalResult {
  order: string[];
  unresolved: string[];
  cycle: string[] | null;
}
