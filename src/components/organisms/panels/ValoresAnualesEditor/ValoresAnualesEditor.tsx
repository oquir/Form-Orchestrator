import { useState } from "react";
import {
  DEFAULT_ANIO_KEY,
  DEFAULT_SMMLV_KEY,
  DEFAULT_UVT_KEY,
} from "../../../../constants/valoresBank";
import { formatNumber } from "../../../../lib/numberFormat/numberFormat";
import { buscarValores } from "../../../../lib/valoresAnuales/valoresAnuales";
import {
  parseValoresPaste,
  usesCustomValores,
  valoresEnUso,
} from "../../../../lib/valoresBank/valoresBank";
import { useFormStore } from "../../../../store/formStore";
import type { ValorAnual, ValoresParseResult } from "../../../../types/valores";
import { Button } from "../../../atoms/Button/Button";
import { BinaryChoiceToggle } from "../../../molecules/BinaryChoiceToggle/BinaryChoiceToggle";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import {
  ACTION_CLASSES,
  BADGE_EMPTY_CLASSES,
  BADGE_LOADED_CLASSES,
  ERROR_CLASSES,
  HINT_CLASSES,
  INPUT_CLASSES,
  PASTE_PLACEHOLDER,
  ROW_CLASSES,
  TEXTAREA_CLASSES,
  WARNING_CLASSES,
} from "./ValoresAnualesEditor.constants";

export function ValoresAnualesEditor() {
  const valores = useFormStore((state) => state.valores);
  const setValores = useFormStore((state) => state.setValores);
  const setValoresSource = useFormStore((state) => state.setValoresSource);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [raw, setRaw] = useState<string>("");
  const [anioKey, setAnioKey] = useState<string>(DEFAULT_ANIO_KEY);
  const [uvtKey, setUvtKey] = useState<string>(DEFAULT_UVT_KEY);
  const [smmlvKey, setSmmlvKey] = useState<string>(DEFAULT_SMMLV_KEY);
  const [error, setError] = useState<string | null>(null);

  const enUso: ValorAnual[] = valoresEnUso(valores);
  const isCustom: boolean = usesCustomValores(valores);
  const cargadas: number = valores.custom?.length ?? 0;

  // El ano en curso es el que usan uvt() y smmlv() cuando no se les pasa ninguno, asi que es el
  // unico que merece un aviso propio si falta.
  const anioActual: number = new Date().getFullYear();
  const actual: ValorAnual | null = buscarValores(enUso, anioActual);

  function load(): void {
    const result: ValoresParseResult = parseValoresPaste(raw, {
      anio: anioKey.trim() || DEFAULT_ANIO_KEY,
      uvt: uvtKey.trim() || DEFAULT_UVT_KEY,
      smmlv: smmlvKey.trim() || DEFAULT_SMMLV_KEY,
    });

    if (result.error || !result.valores) {
      setError(result.error);
      return;
    }

    setValores(result.valores);
    setError(null);
    setRaw("");
    setIsOpen(false);
  }

  return (
    <PanelSection
      title="UVT y salario mínimo"
      aside={
        <span className={cargadas > 0 ? BADGE_LOADED_CLASSES : BADGE_EMPTY_CLASSES}>
          {cargadas > 0 ? `${cargadas} años` : "Por defecto"}
        </span>
      }
    >
      <div className="flex items-center justify-between gap-2">
        <p className={HINT_CLASSES}>Un valor por año, para uvt() y smmlv()</p>
        <button type="button" onClick={() => setIsOpen(!isOpen)} className={ACTION_CLASSES}>
          {isOpen ? "Cerrar" : cargadas > 0 ? "Reemplazar" : "Cargar"}
        </button>
      </div>

      {!isOpen && (
        <>
          {cargadas > 0 && (
            <BinaryChoiceToggle
              value={isCustom}
              onChange={(next) => setValoresSource(next ? "custom" : "default")}
              yesLabel="Personalizado"
              noLabel="Por defecto"
            />
          )}

          {actual === null ? (
            <p className={WARNING_CLASSES}>
              Falta {anioActual}. uvt() y smmlv() van a devolver null y cada script va a caer a su
              propio respaldo.
            </p>
          ) : (
            <p className={HINT_CLASSES}>
              Año en curso: <span className="tabular-nums">{actual.anio}</span> · UVT{" "}
              <span className="tabular-nums">{formatNumber(actual.uvt)}</span> · SMMLV{" "}
              <span className="tabular-nums">{formatNumber(actual.smmlv)}</span>
            </p>
          )}

          <div className="max-h-40 overflow-y-auto">
            <div className={`${ROW_CLASSES} font-semibold text-fg-subtle`}>
              <span>Año</span>
              <span className="text-right">UVT</span>
              <span className="text-right">SMMLV</span>
            </div>
            {enUso.map((valor: ValorAnual) => (
              <div key={valor.anio} className={`${ROW_CLASSES} text-fg-muted`}>
                <span>{valor.anio}</span>
                <span className="text-right">{formatNumber(valor.uvt)}</span>
                <span className="text-right">{formatNumber(valor.smmlv)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {isOpen && (
        <>
          <textarea
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            placeholder={PASTE_PLACEHOLDER}
            aria-label="Respuesta del endpoint de valores anuales"
            className={TEXTAREA_CLASSES}
          />

          <div className="grid grid-cols-3 gap-2">
            <label className="flex flex-col gap-1">
              <span className={HINT_CLASSES}>Campo del año</span>
              <input
                value={anioKey}
                onChange={(event) => setAnioKey(event.target.value)}
                className={INPUT_CLASSES}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={HINT_CLASSES}>Campo de la UVT</span>
              <input
                value={uvtKey}
                onChange={(event) => setUvtKey(event.target.value)}
                className={INPUT_CLASSES}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={HINT_CLASSES}>Campo del SMMLV</span>
              <input
                value={smmlvKey}
                onChange={(event) => setSmmlvKey(event.target.value)}
                className={INPUT_CLASSES}
              />
            </label>
          </div>

          <p className={HINT_CLASSES}>
            Una fila a la que le falte cualquiera de las tres se descarta: media fila daría un 0 que
            pasa por dato bueno.
          </p>

          {error && <p className={ERROR_CLASSES}>{error}</p>}

          <Button variant="primary" onClick={load} className="self-start px-3 py-1 text-xs">
            Cargar valores
          </Button>
        </>
      )}
    </PanelSection>
  );
}
