export interface ColorPickerFieldProps {
  id: string;
  label: string;
  value: string;
  defaultColor: string;
  placeholder: string;
  align?: "left" | "right";
  onChange: (value: string) => void;
}
