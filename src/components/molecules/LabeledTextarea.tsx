import type { TextareaHTMLAttributes } from "react";
import { Label } from "../atoms/Label";
import { Textarea } from "../atoms/Textarea";

interface LabeledTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  variant?: "default" | "code";
}

export function LabeledTextarea({ id, label, variant, ...rest }: LabeledTextareaProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} variant={variant} {...rest} />
    </div>
  );
}
