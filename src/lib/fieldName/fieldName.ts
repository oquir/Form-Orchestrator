import type { CanvasRow } from "../../types/formStructure";
import { FALLBACK_NAME } from "./fieldName.constants";

// El nombre tecnico es la identidad del campo hacia afuera: con el se referencian las formulas,
// las condiciones y todo el export. Tiene que ser unico y valido como identificador del lenguaje
// de formulas, de ahi que se quiten acentos y no pueda empezar por un digito.

export function slugifyFieldName(label: string): string {
  const withoutAccents: string = label.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const slug: string = withoutAccents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  if (slug.length === 0) return FALLBACK_NAME;
  if (/^[0-9]/.test(slug)) return `${FALLBACK_NAME}_${slug}`;

  return slug;
}

export function uniqueFieldName(candidate: string, taken: Set<string>): string {
  if (!taken.has(candidate)) return candidate;

  let suffix = 2;
  while (taken.has(`${candidate}_${suffix}`)) suffix += 1;

  return `${candidate}_${suffix}`;
}

export function collectFieldNames(rows: CanvasRow[], exceptFieldId?: string): Set<string> {
  const names = new Set<string>();

  for (const row of rows) {
    for (const field of row.fields) {
      if (field.id === exceptFieldId) continue;
      names.add(field.name);
    }
  }

  return names;
}

export function migrateFieldNames(rows: CanvasRow[], taken: Set<string>): CanvasRow[] {
  return rows.map((row) => ({
    ...row,
    fields: row.fields.map((field) => {
      if (field.name) {
        taken.add(field.name);
        return field;
      }

      const name: string = uniqueFieldName(slugifyFieldName(field.label), taken);
      taken.add(name);

      return { ...field, name };
    }),
  }));
}
