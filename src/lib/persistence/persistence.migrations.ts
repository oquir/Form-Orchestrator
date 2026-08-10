import { DRAFT_SCHEMA_VERSION } from "./persistence.constants";
import type { DraftMigration, LooseDraft } from "./persistence.types";

// Cadena de migraciones del borrador. Existe porque el borrador vive en localStorage y la forma
// del store cambia seguido: sin version, cada cambio de shape hace que Zod rechace lo guardado y
// el usuario pierda el trabajo con "borrador invalido" como unica explicacion.
//
// Van indexadas por la version de la que salen: MIGRATIONS[1] lleva de 1 a 2. Trabajan sobre el
// objeto crudo, antes de validar, y por eso no pueden suponerle forma a nada: lo unico que hacen
// es agregar o transformar claves y dejar que Zod juzgue el resultado.

const MIGRATIONS: Record<number, DraftMigration> = {
  // 1 -> 2: aparece el preludio del formulario.
  1: (draft) => ({ ...draft, formScript: "" }),
};

// Un hueco en la cadena corta el recorrido y devuelve el borrador con su version vieja, que es
// exactamente lo que el esquema rechaza despues. Preferible a estamparle una version que no tiene.
export function migrateDraft(draft: LooseDraft): LooseDraft {
  let current: LooseDraft = draft;
  let version: number = typeof draft.schemaVersion === "number" ? draft.schemaVersion : 1;

  while (version < DRAFT_SCHEMA_VERSION) {
    const step: DraftMigration | undefined = MIGRATIONS[version];
    if (!step) return current;

    version += 1;
    current = { ...step(current), schemaVersion: version };
  }

  return current;
}
