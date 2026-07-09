import { FIELD_TYPES } from "../../lib/fieldTypes";
import { PaletteChip } from "../molecules/PaletteChip";

export function FieldPalette() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {FIELD_TYPES.map((fieldType) => (
        <PaletteChip key={fieldType.type} fieldType={fieldType} />
      ))}
    </div>
  );
}
