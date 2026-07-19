export interface UseSaveButtonResult {
  lastSavedAt: string | null;
  justSaved: boolean;
  handleSave: () => void;
}
