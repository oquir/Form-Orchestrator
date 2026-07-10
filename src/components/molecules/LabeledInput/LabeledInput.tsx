import { Input } from "../../atoms/Input/Input";
import { Label } from "../../atoms/Label/Label";
import type { LabeledInputProps } from "./LabeledInput.types";

export function LabeledInput({ id, label, ...rest }: LabeledInputProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...rest} />
    </div>
  );
}
