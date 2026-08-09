import { useEffect, useRef, useState } from "react";
import { CheckCircle, Copy } from "reicon-react";
import type { CopyIconButtonProps } from "./CopyIconButton.types";

export function CopyIconButton({ value, title = "Copiar" }: CopyIconButtonProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);

  // El temporizador se limpia al desmontar: el panel cambia de campo mientras el tilde sigue
  // visible, y sin esto se llama a setCopied sobre un componente que ya no esta.
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(value);
    setCopied(true);

    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copiado" : title}
      aria-label={copied ? "Copiado" : title}
      className="flex h-5 w-5 items-center justify-center rounded text-fg-subtle transition-colors hover:cursor-pointer hover:text-fg"
    >
      {copied ? <CheckCircle size={12} weight="Filled" /> : <Copy size={12} />}
    </button>
  );
}
