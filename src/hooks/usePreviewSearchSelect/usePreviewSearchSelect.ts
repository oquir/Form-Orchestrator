import { useEffect, useMemo, useRef, useState } from "react";
import type { CatalogOption } from "../../types/catalog";
import type {
  UsePreviewSearchSelectParams,
  UsePreviewSearchSelectResult,
} from "./usePreviewSearchSelect.types";
import { filterOptions, findSelected } from "./usePreviewSearchSelect.utils";

// El modal del search_select: que esta escrito, que opciones sobreviven al filtro y cual quedo
// elegida. Existe separado del select nativo porque son 425 actividades por 15 repeticiones, asi
// que lo caro no es filtrar sino montar las opciones.
export function usePreviewSearchSelect({
  options,
  value,
  onChange,
}: UsePreviewSearchSelectParams): UsePreviewSearchSelectResult {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = findSelected(options, value);
  // Cerrado no se filtra nada: es justamente lo que evita las 6.375 opciones montadas de golpe.
  const results: CatalogOption[] = useMemo(
    () => (isOpen ? filterOptions(options, query) : []),
    [isOpen, options, query],
  );

  useEffect(() => {
    if (!isOpen) return;

    // Por ref y no con autoFocus, que Biome prohibe sin distinguir este caso del que le preocupa.
    searchRef.current?.focus();

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return {
    isOpen,
    query,
    searchRef,
    selected,
    results,
    // Cada apertura arranca con el buscador limpio, no con lo que se tipeo la vez anterior.
    open: () => {
      setQuery("");
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
    setQuery,
    choose: (option) => {
      onChange(option ? option.id : "");
      setIsOpen(false);
    },
  };
}
