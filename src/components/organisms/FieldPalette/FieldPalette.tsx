import { PaletteChip } from "../../molecules/PaletteChip/PaletteChip";
import {
  PALETTE_SECTIONS,
  SECTION_GRID_CLASSES,
  SECTION_HEADING_CLASSES,
} from "./FieldPalette.constants";

export function FieldPalette() {
  return (
    <div className="flex flex-col gap-4">
      {PALETTE_SECTIONS.map((section) => (
        <section key={section.category} aria-labelledby={`palette-${section.category}`}>
          <h3 id={`palette-${section.category}`} className={SECTION_HEADING_CLASSES}>
            {section.heading}
          </h3>
          <ul className={SECTION_GRID_CLASSES}>
            {section.fieldTypes.map((fieldType) => (
              <li key={fieldType.type}>
                <PaletteChip fieldType={fieldType} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
