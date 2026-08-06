import type { CanvasRow } from "../../types/formStructure";
import type { FieldRename } from "../../types/persistenceTypes";
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

// Segunda linea de defensa del nombre unico, detras del editor. Un borrador editado a mano desde
// las devtools, o guardado por una version anterior a la regla, puede traer dos campos con el
// mismo nombre; antes se les creia y entraban los dos.
//
// Renombrar el repetido no arregla las formulas que lo referenciaban -- con dos campos homonimos
// ya eran ambiguas, porque el export indexa por nombre y un Map se queda con uno solo. Lo que si
// hace es volver el conflicto deterministico y visible: el primero conserva el nombre, asi que las
// referencias siguen apuntando a un campo real, y el segundo queda reportado en `renamed` para que
// quien carga el borrador sepa que revisar.
export function migrateFieldNames(
  rows: CanvasRow[],
  taken: Set<string>,
  renamed: FieldRename[] = [],
): CanvasRow[] {
  return rows.map((row) => ({
    ...row,
    fields: row.fields.map((field) => {
      const candidate: string = field.name ? field.name : slugifyFieldName(field.label);
      const name: string = uniqueFieldName(candidate, taken);
      taken.add(name);

      // Solo es un renombre si el campo ya traia nombre: rellenar el de uno que venia sin el es
      // una migracion y no hay nada que revisar.
      if (field.name && name !== field.name) {
        renamed.push({ from: field.name, to: name, label: field.label });
      }

      return field.name === name ? field : { ...field, name };
    }),
  }));
}
