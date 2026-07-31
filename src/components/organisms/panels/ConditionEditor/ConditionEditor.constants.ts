import type { ConditionKind } from "../../../../types/field";

export const CONDITION_COPY: Record<
  ConditionKind,
  { label: string; fieldLabel: string; emptyHint: string }
> = {
  enable: {
    label: "Habilitación condicional",
    fieldLabel: "Se habilita cuando el campo…",
    emptyHint: "Agregá otros campos al lienzo para poder condicionar este.",
  },
  visible: {
    label: "Visibilidad condicional",
    fieldLabel: "Se muestra cuando el campo…",
    emptyHint: "Agregá otros campos al lienzo para poder mostrar u ocultar este.",
  },
};
