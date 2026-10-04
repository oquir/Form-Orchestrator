import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useRef } from "react";
import type { UseModalKeyGuardResult } from "./useModalKeyGuard.types";

// Aisla el teclado de un modal abierto desde el sidebar, con el campo que edita seleccionado
// detras. Los atajos globales escuchan en window: con el foco en un boton del modal, o en el body
// tras un clic en el fondo o al quitar el boton que lo tenia, Escape deseleccionaria el campo y
// desmontaria el modal, Suprimir borraria el campo y Ctrl+A cambiaria la seleccion.
//
// No frena todo en captura como el calculo sin codigo: asi tambien se le quitaria a CodeMirror,
// que atiende el teclado con listeners propios (Enter acepta el autocompletado, Ctrl+Space lo
// abre, Ctrl+Z deshace dentro del editor). Lo que nace dentro del dialogo llega a sus controles y
// se frena al salir de el; lo que nace afuera se frena en captura, antes de llegar a nadie.

// Ctrl+S pasa siempre: frenarlo no anula el atajo, se lo deja al "Guardar como" del navegador.
function isSaveShortcut(event: KeyboardEvent | ReactKeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";
}

export function useModalKeyGuard(onClose: () => void): UseModalKeyGuardResult {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (isSaveShortcut(event)) return;
      if (event.target instanceof Node && dialogRef.current?.contains(event.target)) return;

      event.stopPropagation();
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown, true);

    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose]);

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>): void {
    if (isSaveShortcut(event)) return;

    event.stopPropagation();
    // Un Escape que CodeMirror ya uso (cerrar el autocompletado, colapsar una seleccion) no cierra.
    if (event.key === "Escape" && !event.defaultPrevented) onClose();
  }

  return { dialogRef, handleDialogKeyDown };
}
