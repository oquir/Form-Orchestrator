import type { CanvasField } from "./field";

export interface FieldGraph {
  nodes: string[];
  edges: Map<string, string[]>;
  byId: Map<string, CanvasField>;
  byName: Map<string, string>;
}
