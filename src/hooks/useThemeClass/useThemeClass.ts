import { useEffect } from "react";
import { useFormStore } from "../../store/formStore";

// El modo oscuro de Tailwind es por clase, asi que hay que reflejar el estado del store en el
// elemento raiz: sin esto ninguna variante dark: se aplica.
export function useThemeClass() {
  const isDarkMode = useFormStore((state) => state.isDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);
}
