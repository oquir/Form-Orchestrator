import type { FechasMaximasPresentacion } from "../../../types/maxDates";

export interface MaxDatesPasteFormProps {
  onLoad: (fechas: FechasMaximasPresentacion) => void;
  onClose: () => void;
}
