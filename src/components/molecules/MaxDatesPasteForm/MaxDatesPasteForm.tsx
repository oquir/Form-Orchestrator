import { useState } from "react";
import { parseMaxDatesPaste } from "../../../lib/maxDatesBank/maxDatesBank";
import type { MaxDatesParseResult } from "../../../types/maxDates";
import { Button } from "../../atoms/Button/Button";
import {
  ERROR_CLASSES,
  HINT_CLASSES,
  PASTE_PLACEHOLDER,
  TEXTAREA_CLASSES,
} from "./MaxDatesPasteForm.constants";
import type { MaxDatesPasteFormProps } from "./MaxDatesPasteForm.types";

export function MaxDatesPasteForm({ onLoad, onClose }: MaxDatesPasteFormProps) {
  const [raw, setRaw] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  function load(): void {
    const result: MaxDatesParseResult = parseMaxDatesPaste(raw);

    if (result.error || !result.fechas) {
      setError(result.error);
      return;
    }

    onLoad(result.fechas);
    setError(null);
    setRaw("");
    onClose();
  }

  return (
    <>
      <textarea
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        placeholder={PASTE_PLACEHOLDER}
        aria-label="Respuesta del endpoint de fechas máximas"
        className={TEXTAREA_CLASSES}
      />

      <p className={HINT_CLASSES}>
        Se pega el objeto completo, tal como lo devuelve el endpoint: no hay que nombrar columnas
        porque ya viene con la forma que se necesita. Si viene envuelto en{" "}
        <code className="font-mono">result</code> o <code className="font-mono">data</code>, se
        desenvuelve solo.
      </p>

      {error && <p className={ERROR_CLASSES}>{error}</p>}

      <Button variant="primary" onClick={load} className="self-start px-3 py-1 text-xs">
        Cargar fechas
      </Button>
    </>
  );
}
