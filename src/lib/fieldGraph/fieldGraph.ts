import type { CanvasField } from "../../types/field";
import { collectRuleRefs, ruleFormulaExpressions } from "../fieldRule/fieldRule";
import { collectFormulaRefs, parseFormula } from "../formula/formula";
import type { FieldGraph, TopologicalResult } from "./fieldGraph.types";

export function buildNameToIdIndex(fields: CanvasField[]): Map<string, string> {
  const index: Map<string, string> = new Map();

  for (const field of fields) {
    index.set(field.name, field.id);
  }

  return index;
}

function formulaRefIds(source: string | undefined, byName: Map<string, string>): string[] {
  if (!source) return [];

  const ids: string[] = [];

  for (const name of collectFormulaRefs(parseFormula(source).ast)) {
    const id: string | undefined = byName.get(name);
    if (id) ids.push(id);
  }

  return ids;
}

export function fieldDependencies(field: CanvasField, byName: Map<string, string>): string[] {
  const candidates: string[] = [
    ...(field.visibleWhen ? [field.visibleWhen.fieldId] : []),
    ...(field.enableWhen ? [field.enableWhen.fieldId] : []),
    ...collectRuleRefs(field.logic.rules),
    ...field.logic.dependencies,
    ...formulaRefIds(field.logic.formula, byName),
    ...ruleFormulaExpressions(field.logic.rules).flatMap((expression) =>
      formulaRefIds(expression, byName),
    ),
  ];

  const unique: string[] = [];
  const seen = new Set<string>();

  for (const id of candidates) {
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push(id);
  }

  return unique;
}

export function buildFieldGraph(fields: CanvasField[]): FieldGraph {
  const byId: Map<string, CanvasField> = new Map(fields.map((field) => [field.id, field]));
  const byName: Map<string, string> = buildNameToIdIndex(fields);
  const edges: Map<string, string[]> = new Map();

  for (const field of fields) {
    edges.set(
      field.id,
      fieldDependencies(field, byName).filter((id) => byId.has(id)),
    );
  }

  return { nodes: fields.map((field) => field.id), edges, byId, byName };
}

export function findCycle(graph: FieldGraph): string[] | null {
  const done = new Set<string>();
  const inPath = new Set<string>();
  const path: string[] = [];

  function visit(id: string): string[] | null {
    if (done.has(id)) return null;

    if (inPath.has(id)) {
      return [...path.slice(path.indexOf(id)), id];
    }

    inPath.add(id);
    path.push(id);

    for (const dependency of graph.edges.get(id) ?? []) {
      const cycle: string[] | null = visit(dependency);
      if (cycle) return cycle;
    }

    path.pop();
    inPath.delete(id);
    done.add(id);

    return null;
  }

  for (const id of graph.nodes) {
    const cycle: string[] | null = visit(id);
    if (cycle) return cycle;
  }

  return null;
}

export function topologicalOrder(graph: FieldGraph): TopologicalResult {
  const order: string[] = [];
  const emitted = new Set<string>();
  let progressed = true;

  while (progressed) {
    progressed = false;

    for (const id of graph.nodes) {
      if (emitted.has(id)) continue;

      const dependencies: string[] = graph.edges.get(id) ?? [];
      const ready: boolean = dependencies.every((dependency) => emitted.has(dependency));

      if (!ready) continue;

      order.push(id);
      emitted.add(id);
      progressed = true;
    }
  }

  const unresolved: string[] = graph.nodes.filter((id) => !emitted.has(id));

  return { order, unresolved, cycle: unresolved.length > 0 ? findCycle(graph) : null };
}

export function wouldCreateCycle(
  graph: FieldGraph,
  fieldId: string,
  dependsOnFieldId: string,
): boolean {
  if (fieldId === dependsOnFieldId) return true;

  const visited = new Set<string>();
  const stack: string[] = [dependsOnFieldId];

  while (stack.length > 0) {
    const id: string = stack.pop() as string;

    if (id === fieldId) return true;
    if (visited.has(id)) continue;

    visited.add(id);

    for (const dependency of graph.edges.get(id) ?? []) {
      stack.push(dependency);
    }
  }

  return false;
}

export function describeCycle(graph: FieldGraph, cycle: string[]): string {
  return cycle.map((id) => graph.byId.get(id)?.name ?? id).join(" → ");
}
