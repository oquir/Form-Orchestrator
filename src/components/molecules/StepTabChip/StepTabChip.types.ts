export interface StepTabChipProps {
  label: string;
  active: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  removeTitle?: string;
  removeIconSize?: number;
  className?: string;
}
