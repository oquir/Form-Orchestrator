export interface StepTabChipProps {
  index: number;
  label: string;
  active: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  removeTitle?: string;
  removeIconSize?: number;
  className?: string;
}
