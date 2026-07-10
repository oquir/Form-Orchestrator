import type { FormType } from "../../../types/storeTypes";

export const FORM_TYPES: { value: FormType; label: string; description: string }[] = [
  {
    value: "industria_comercio",
    label: "Industria y Comercio",
    description: "Carga una plantilla base preexistente para empezar más rápido.",
  },
  {
    value: "retencion_industria_comercio",
    label: "Retención de Industria y Comercio",
    description: "Empieza desde un lienzo en blanco.",
  },
  {
    value: "autorretencion",
    label: "Autorretención",
    description: "Empieza desde un lienzo en blanco.",
  },
];
