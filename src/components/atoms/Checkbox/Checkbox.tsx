import type { CheckboxProps } from "./Checkbox.types";

export function Checkbox(props: CheckboxProps) {
  return <input type="checkbox" {...props} />;
}
