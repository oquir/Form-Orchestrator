import type { InputHTMLAttributes } from "react";

export interface LabeledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}
