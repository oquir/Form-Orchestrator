import type { TextareaHTMLAttributes } from "react";

export interface LabeledTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  variant?: "default" | "code";
}
