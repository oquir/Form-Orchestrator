import { useId, useState } from "react";
import { InfoCircle } from "reicon-react";
import {
  BUBBLE_CLASSES,
  TRIGGER_CLASSES,
  TRIGGER_IDLE_CLASSES,
  TRIGGER_PINNED_CLASSES,
} from "./InfoHint.constants";
import type { InfoHintProps } from "./InfoHint.types";

// Pasar el puntero muestra el texto y un clic lo deja fijo, como el tooltip del simulador: el hover
// solo no existe en pantalla tactil ni para el teclado.
export function InfoHint({ text, label }: InfoHintProps) {
  const [pinned, setPinned] = useState<boolean>(false);
  const bubbleId: string = useId();

  return (
    // Sin relative a proposito: la burbuja se posiciona contra el ancestro posicionado mas cercano,
    // que es quien decide su ancho. Quien monte esto pone relative donde quiera anclarla.
    <span className="group/info flex">
      <button
        type="button"
        aria-label={label}
        aria-describedby={bubbleId}
        onClick={() => setPinned((open) => !open)}
        onBlur={() => setPinned(false)}
        onKeyDown={(event) => {
          if (event.key !== "Escape" || !pinned) return;
          // Sin cortar la propagacion el Escape global tambien deselecciona el campo, y el panel
          // entero se desmontaria por cerrar una ayuda.
          event.stopPropagation();
          setPinned(false);
        }}
        className={`${TRIGGER_CLASSES} ${pinned ? TRIGGER_PINNED_CLASSES : TRIGGER_IDLE_CLASSES}`}
      >
        <InfoCircle size={13} />
      </button>

      <span
        id={bubbleId}
        role="tooltip"
        className={`${BUBBLE_CLASSES} ${pinned ? "block" : "hidden group-hover/info:block"}`}
      >
        {text}
      </span>
    </span>
  );
}
