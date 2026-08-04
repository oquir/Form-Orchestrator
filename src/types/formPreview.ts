import type { CatalogBank } from "./catalog";
import type { PreviewState, RuntimeIssue, RuntimeModel, RuntimeSnapshot } from "./formRuntime";

export interface FormPreviewApi {
  model: RuntimeModel;
  // Las opciones cargadas a mano: el equivalente al catalogo que consultaria el consumidor.
  catalogBank: CatalogBank;
  state: PreviewState;
  snapshot: RuntimeSnapshot;
  errors: Record<string, string>;
  issues: RuntimeIssue[];
  payload: Record<string, unknown>;
  revealed: Record<string, boolean>;
  setValue: (name: string, value: unknown, groupId?: string, index?: number) => void;
  addGroupItem: (groupId: string) => void;
  removeGroupItem: (groupId: string, index: number) => void;
  // Muestra los errores de esas claves y responde si el paso quedo limpio.
  validateKeys: (keys: string[]) => boolean;
  reset: () => void;
}
