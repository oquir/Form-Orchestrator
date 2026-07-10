export interface AddToggleGroupModalProps {
  onConfirm: (config: { title?: string; optionCount: number }) => void;
  onCancel: () => void;
}
