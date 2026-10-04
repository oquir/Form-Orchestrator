import type { KeyboardEvent, ReactNode, Ref } from "react";

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
  // Para el modal que maneja su propio teclado (useModalKeyGuard): el nodo del dialogo, que dice
  // que tecla nacio adentro, y lo que escucha en el.
  dialogRef?: Ref<HTMLDivElement>;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
}
