import { Label } from "../../atoms/Label/Label";
import { Textarea } from "../../atoms/TextArea/Textarea";
import type { LabeledTextareaProps } from "./LabeledTextarea.types";

export function LabeledTextarea({ id, label, variant, ...rest }: LabeledTextareaProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} variant={variant} {...rest} />
    </div>
  );
}
