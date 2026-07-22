export interface AddOptionsFieldModalProps {
  fieldTypeLabel: string;
  onConfirm: (config: { title?: string; optionCount: number }) => void;
  onCancel: () => void;
}
