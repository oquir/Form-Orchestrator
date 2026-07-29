import type { FormTypeOption } from "./SetupWizardModal.types";

export const FORM_TYPES: FormTypeOption[] = [
  {
    value: "industria_comercio",
    label: "Industria y Comercio",
    description: "Plantilla base lista: 7 pasos y 2 pasos de modal introductorio.",
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
