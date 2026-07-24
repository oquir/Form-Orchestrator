import { useEffect } from "react";
import { useFormStore } from "../../store/formStore";

export function useThemeClass() {
  const isDarkMode = useFormStore((state) => state.isDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);
}
