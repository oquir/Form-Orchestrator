import type { CatalogOption } from "../../../../types/catalog";

export interface PreviewSearchSelectProps {
  inputId: string;
  label: string;
  options: CatalogOption[];
  value: unknown;
  disabled: boolean;
  invalid: boolean;
  showsTarifa: boolean;
  placeholder?: string;
  onChange: (value: unknown) => void;
}
