import type { TextareaHTMLAttributes } from "react";

export type TextareaVariant = "default" | "code";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: TextareaVariant;
}
