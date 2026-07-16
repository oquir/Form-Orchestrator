import { PaletteChip } from "../../molecules/PaletteChip/PaletteChip";
import { BASIC_FIELD_TYPES, COMPLEX_FIELD_TYPES } from "./FieldPalette.constants";

export function FieldPalette() {
  return (
    <div className="flex flex-col gap-4">
      <ul className="grid list-none grid-cols-2 gap-2">
        {BASIC_FIELD_TYPES.map((fieldType) => (
          <li key={fieldType.type}>
            <PaletteChip fieldType={fieldType} />
          </li>
        ))}
      </ul>

      {COMPLEX_FIELD_TYPES.length > 0 && (
        <section aria-labelledby="complex-fields-heading">
          <h3
            id="complex-fields-heading"
            className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500"
          >
            Campos complejos
          </h3>
          <ul className="grid list-none grid-cols-2 gap-2">
            {COMPLEX_FIELD_TYPES.map((fieldType) => (
              <li key={fieldType.type}>
                <PaletteChip fieldType={fieldType} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
