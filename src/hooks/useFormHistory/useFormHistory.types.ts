export interface UseFormHistoryResult {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}
