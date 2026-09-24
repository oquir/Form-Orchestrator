import type { ConditionKind } from "../../../../types/field";

export const CONDITION_COPY: Record<
  ConditionKind,
  { label: string; description: string; fieldLabel: string; emptyHint: string }
> = {
  enable: {
    label: "Habilitación condicional",
    description:
      "Deja el campo a la vista pero bloqueado hasta que otro campo cumpla la condición. A diferencia de la visibilidad, el usuario lo ve aunque no pueda escribir en él.",
    fieldLabel: "Se habilita cuando el campo…",
    emptyHint: "Agregá otros campos al lienzo para poder condicionar este.",
  },
  visible: {
    label: "Visibilidad condicional",
    description:
      "Muestra el campo solo cuando otro campo cumple la condición. Mientras está oculto no se dibuja ni se valida, así que no frena el paso al siguiente.",
    fieldLabel: "Se muestra cuando el campo…",
    emptyHint: "Agregá otros campos al lienzo para poder mostrar u ocultar este.",
  },
};
