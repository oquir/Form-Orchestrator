import type { PreviewState, RuntimeModel, RuntimeValues } from "../../types/formRuntime";

export function emptyGroupItem(model: RuntimeModel, groupId: string): RuntimeValues {
  const item: RuntimeValues = {};

  for (const field of model.groupFields.get(groupId) ?? []) item[field.name] = undefined;

  return item;
}

// El modelo se reconstruye en cada edicion del lienzo. Si aparece o desaparece un grupo hay que
// acomodar el estado sin perder lo que el usuario ya escribio.
export function reconcileState(model: RuntimeModel, state: PreviewState): PreviewState {
  const groups: Record<string, RuntimeValues[]> = {};
  let changed = false;

  for (const [groupId] of model.groupFields) {
    const min: number = Math.max(1, model.groupsById.get(groupId)?.min ?? 1);
    const current: RuntimeValues[] = state.groups[groupId] ?? [];
    const filled: RuntimeValues[] = [...current];

    while (filled.length < min) filled.push(emptyGroupItem(model, groupId));

    if (filled.length !== current.length) changed = true;
    groups[groupId] = filled;
  }

  if (Object.keys(groups).length !== Object.keys(state.groups).length) changed = true;

  return changed ? { ...state, groups } : state;
}
