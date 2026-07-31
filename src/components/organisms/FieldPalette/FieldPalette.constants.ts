import { FIELD_TYPES } from "../../../constants/fieldTypes";
import type { FieldTypeCategory } from "../../../types/fieldTypes";
import type { PaletteSection } from "./FieldPalette.types";

const SECTION_ORDER: FieldTypeCategory[] = ["basico", "complejo", "contenido"];

const SECTION_HEADINGS: Record<FieldTypeCategory, string> = {
  basico: "Campos básicos",
  complejo: "Campos complejos",
  contenido: "Contenido",
};

export const PALETTE_SECTIONS: PaletteSection[] = SECTION_ORDER.map((category) => ({
  category,
  heading: SECTION_HEADINGS[category],
  fieldTypes: FIELD_TYPES.filter((fieldType) => fieldType.category === category),
})).filter((section) => section.fieldTypes.length > 0);

export const SECTION_HEADING_CLASSES: string =
  "mb-2 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle";

export const SECTION_GRID_CLASSES: string = "grid list-none grid-cols-2 gap-2";
