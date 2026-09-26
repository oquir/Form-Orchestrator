import type { PayloadDestination } from "../../../types/payloadMapping";

export interface PayloadDestinationOption {
  destination: PayloadDestination;
  label: string;
  hint: string;
}

export interface PayloadDestinationSwitchProps {
  destination: PayloadDestination;
  // Un destino con motivo sale deshabilitado, no oculto, y el motivo va en su title.
  disabledReasons: Partial<Record<PayloadDestination, string>>;
  onChange: (destination: PayloadDestination) => void;
}
