import type { ReactNode } from "react";

export interface ModalShellProps {
  title: ReactNode;
  children: ReactNode;
  // Rotulo en pastilla sobre el titulo, para cuando el titulo nombra otra cosa (el campo que se
  // edita) y hace falta decir que herramienta es.
  eyebrow?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  // Sin onClose no hay X: el asistente inicial y el borrador recuperado obligan a elegir.
  onClose?: () => void;
  maxWidthClassName?: string;
}
