import type { InputProps } from "../../atoms/Input/Input.types";

export interface LabeledInputProps extends InputProps {
  id: string;
  label: string;
}
