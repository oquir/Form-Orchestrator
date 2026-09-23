import { Xmark } from "reicon-react";
import { useFormStore } from "../../../store/formStore";
import { IconButton } from "../../atoms/IconButton/IconButton";
import type { TransferNoticeProps } from "./TransferNotice.types";

// El margen por los cuatro lados es el default y no una clase fija porque el cuerpo del panel
// derecho no tiene padding propio: cada bloque pone el suyo, y un envoltorio con padding aca
// dejaria un hueco muerto arriba cada vez que no hay aviso, que es casi siempre. Plegado el panel
// el aviso cuelga del chip flotante, que le pasa posicion absoluta en lugar de margen.
export function TransferNotice({ className = "m-3" }: TransferNoticeProps) {
  const transferNotice = useFormStore((state) => state.transferNotice);
  const dismissTransferNotice = useFormStore((state) => state.dismissTransferNotice);

  if (!transferNotice) return null;

  return (
    <div
      className={`flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200 ${className}`}
    >
      <p className="flex-1">{transferNotice}</p>
      <IconButton
        onClick={dismissTransferNotice}
        title="Cerrar aviso"
        className="shrink-0 text-amber-500 hover:cursor-pointer hover:text-amber-700 dark:text-amber-300 dark:hover:text-amber-100"
      >
        <Xmark size={14} weight="Filled" />
      </IconButton>
    </div>
  );
}
