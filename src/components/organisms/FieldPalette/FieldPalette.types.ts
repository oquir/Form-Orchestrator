import type { FieldTypeCategory, FieldTypeDef } from "../../../types/fieldTypes";

export interface PaletteSection {
  category: FieldTypeCategory;
  heading: string;
  fieldTypes: FieldTypeDef[];
}
