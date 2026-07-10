import { FIELD_TYPES } from "../../../types/fieldTypes";
import { PaletteChip } from "../../molecules/PaletteChip/PaletteChip";

const BASIC_FIELD_TYPES = FIELD_TYPES.filter((fieldType) => fieldType.category === "basico");
const COMPLEX_FIELD_TYPES = FIELD_TYPES.filter((fieldType) => fieldType.category === "complejo");

export function FieldPalette() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        {BASIC_FIELD_TYPES.map((fieldType) => (
          <PaletteChip key={fieldType.type} fieldType={fieldType} />
        ))}
      </div>

      {COMPLEX_FIELD_TYPES.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
            Campos complejos
          </p>
          <div className="grid grid-cols-2 gap-2">
            {COMPLEX_FIELD_TYPES.map((fieldType) => (
              <PaletteChip key={fieldType.type} fieldType={fieldType} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
