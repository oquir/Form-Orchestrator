import type { ReactNode } from "react";

export interface PanelHeaderProps {
  title: string;
  // ReactNode y no string para poder marcar el nombre tecnico en monoespaciada: es un identificador
  // que se escribe en formulas, y en la tipografia del texto se confunde con una frase.
  subtitle: ReactNode;
}
