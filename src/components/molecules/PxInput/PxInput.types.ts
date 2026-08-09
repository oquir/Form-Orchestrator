export interface PxInputProps {
  id: string;
  label: string;
  // El valor CSS completo tal como se guarda ("10px"), no el numero suelto.
  value: string;
  onChange: (value: string) => void;
}
