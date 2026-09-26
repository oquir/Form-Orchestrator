import type { PayloadDestinationOption } from "./PayloadDestinationSwitch.types";

export const PAYLOAD_DESTINATIONS: PayloadDestinationOption[] = [
  {
    destination: "contract",
    label: "Contrato",
    hint: "Va a una propiedad del objeto que recibe la API.",
  },
  {
    destination: "concept",
    label: "Concepto",
    hint: "Va en la lista de conceptos, para lo que el contrato no contempla.",
  },
  {
    destination: "excluded",
    label: "Excluido",
    hint: "No viaja: solo sirve dentro del formulario.",
  },
];

export const SWITCH_ITEM_DISABLED_CLASSES: string =
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-fg-muted";
