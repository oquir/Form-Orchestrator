import type { TextareaHTMLAttributes } from "react";

export interface LabeledTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  variant?: "default" | "code";
  // Cuando el rotulo de la tarjeta que lo contiene ya dice lo mismo. Sigue existiendo para el
  // lector de pantalla: se oculta, no se quita.
  labelHidden?: boolean;
}
