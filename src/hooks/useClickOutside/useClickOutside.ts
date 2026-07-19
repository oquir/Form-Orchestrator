import { type RefObject, useEffect } from "react";

/**
 * Llama a `onOutside` cuando ocurre un `mousedown` fuera del elemento referenciado.
 * El listener sólo se registra mientras `enabled` es `true`, evitando trabajo cuando
 * el popover/menú está cerrado.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: () => void,
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    function handleClickOutside(event: MouseEvent): void {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutside();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, onOutside, enabled]);
}
