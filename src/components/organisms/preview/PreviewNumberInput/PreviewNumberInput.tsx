import { useState } from "react";
import { applyRounding } from "../../../../lib/fieldRounding/fieldRounding";
import {
  formatForDisplay,
  parseFormattedNumber,
  sanitizeNumericInput,
  toEditableText,
} from "../../../../lib/numberFormat/numberFormat";
import type { PreviewNumberInputProps } from "./PreviewNumberInput.types";

export function PreviewNumberInput({
  field,
  value,
  disabled,
  inputId,
  className,
  onChange,
}: PreviewNumberInputProps) {
  // El texto tipeado vive aca mientras el campo esta enfocado, y solo mientras lo esta. Sin el,
  // escribir "1," redibuja desde el estado -- que ya vale 1 -- y la coma recien tecleada
  // desaparece bajo los dedos. En reposo el texto se deriva del valor, que es la unica verdad.
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <input
      id={inputId}
      // No puede ser type="number". Por spec de HTML el valor tiene que ser un numero de punto
      // flotante valido, donde el punto es el separador DECIMAL: "1.000" ahi vale uno, y
      // "1.000,5" es invalido y deja el campo en blanco. inputMode conserva el teclado numerico
      // del celular, y sanitizeNumericInput reemplaza al rechazo nativo -- con creces, porque el
      // nativo aceptaba la "e" de la notacion cientifica.
      type="text"
      inputMode="decimal"
      autoComplete="off"
      disabled={disabled}
      value={draft ?? formatForDisplay(field, value)}
      onFocus={() => setDraft(toEditableText(value))}
      onChange={(event) => {
        const clean: string = sanitizeNumericInput(event.target.value);
        setDraft(clean);
        // Lo que sale al estado es siempre un numero, nunca el texto: un "1.000" filtrado hasta
        // aca viajaria al payload como string y los scripts lo leerian como 1.
        onChange(parseFormattedNumber(clean) ?? "");
      }}
      onBlur={() => {
        // draft en null significa que nunca hubo foco, asi que no hay nada que confirmar. Sin
        // esta guarda un blur programatico vaciaria el campo.
        if (draft === null) return;

        const next: unknown = applyRounding(field, parseFormattedNumber(draft) ?? "");
        setDraft(null);
        if (next !== value) onChange(next);
      }}
      className={className}
    />
  );
}
