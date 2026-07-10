export interface ColorPickerFieldProps {
  id: string;
  label: string;
  value: string;
  defaultColor: string;
  placeholder: string;
  onChange: (value: string) => void;
}
