import { PRESENTATIONAL_FIELD_TYPES } from "../../constants/fieldTypes";
import type { CanvasField } from "../../types/field";

// Separa los campos que recogen un valor de los que solo muestran contenido. Conviene preguntarlo
// por aca y no comparar el tipo a mano, para que los paneles, el schema y el export no se
// desalineen. Un campo presentacional conserva su posicion, sus estilos y su visibleWhen, pero
// pierde validaciones, mapeo, formula y reglas: no hay valor que observar.

export function isPresentationalField(type: string): boolean {
  return PRESENTATIONAL_FIELD_TYPES.includes(type);
}

export function isInputField(type: string): boolean {
  return !isPresentationalField(type);
}

export function findLabelFor(fields: CanvasField[], fieldId: string): CanvasField | null {
  return fields.find((field) => field.labelFor === fieldId) ?? null;
}

// Para preguntarlo campo por campo. findLabelFor recorre la lista entera cada vez, asi que usarla
// dentro de un bucle sobre los mismos campos cuesta al cuadrado; el lienzo dibuja un chip por campo
// y cada uno preguntaba por su cuenta.
export function buildLinkedLabelIndex(fields: CanvasField[]): Map<string, CanvasField> {
  const index: Map<string, CanvasField> = new Map();

  // Gana la primera, como findLabelFor: el store mantiene el 1:1, pero un borrador manipulado a
  // mano podria traer dos etiquetas apuntando al mismo campo y ahi las dos respuestas difieren.
  for (const field of fields) {
    if (field.labelFor && !index.has(field.labelFor)) index.set(field.labelFor, field);
  }

  return index;
}

// Que un campo tenga etiqueta externa se calcula, nunca se guarda: el vinculo vive solo en la
// etiqueta, asi que no hay dos extremos que puedan quedar desincronizados.
export function hasLinkedLabel(fields: CanvasField[], fieldId: string): boolean {
  return findLabelFor(fields, fieldId) !== null;
}

export function labelTargetCandidates(fields: CanvasField[], labelId: string): CanvasField[] {
  const current: string | undefined = fields.find((field) => field.id === labelId)?.labelFor;

  return fields.filter((field) => {
    if (!isInputField(field.type)) return false;
    // El destino actual sigue en la lista aunque ya este tomado, o al abrir el desplegable la
    // opcion elegida desapareceria de sus propias opciones.
    if (field.id === current) return true;

    return !hasLinkedLabel(fields, field.id);
  });
}
