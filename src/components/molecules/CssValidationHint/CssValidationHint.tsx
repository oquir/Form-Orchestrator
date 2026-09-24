import { unsupportedDeclarations } from "../../../lib/cssStyles/cssStyles";
import type { CssValidationHintProps } from "./CssValidationHint.types";

// Aviso, no bloqueo: que este navegador no reconozca una declaracion no la hace invalida en el
// del consumidor. No hay sanitizador de CSS -- la frontera de confianza del archivo ya la puso
// logic.script -- asi que esto es solo avisar donde se escribe, nunca impedir guardar.
export function CssValidationHint({ text }: CssValidationHintProps) {
  const unsupported: string[] = unsupportedDeclarations(text);
  if (unsupported.length === 0) return null;

  return (
    <p className="text-[11px] text-amber-600 dark:text-amber-400">
      El navegador no reconoce: {unsupported.join(", ")}
    </p>
  );
}
