import type { PreviewState, RuntimeIssue, RuntimeModel, RuntimeSnapshot } from "./formRuntime";

export interface FormPreviewApi {
  model: RuntimeModel;
  state: PreviewState;
  snapshot: RuntimeSnapshot;
  errors: Record<string, string>;
  issues: RuntimeIssue[];
  payload: Record<string, unknown>;
  showErrors: boolean;
  setValue: (name: string, value: unknown, groupId?: string, index?: number) => void;
  addGroupItem: (groupId: string) => void;
  removeGroupItem: (groupId: string, index: number) => void;
  validateAll: () => void;
  reset: () => void;
}
