import type { CatalogOption } from "../../../../types/catalog";

export interface PreviewSearchSelectProps {
  inputId: string;
  label: string;
  options: CatalogOption[];
  value: unknown;
  disabled: boolean;
  invalid: boolean;
  onChange: (value: unknown) => void;
}
