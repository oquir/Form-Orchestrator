import { lazy, Suspense } from "react";
import { Label } from "../../atoms/Label/Label";
import { SCRIPT_SELECT_CLASSES, SCRIPT_TEXTAREA_CLASSES } from "./ScriptInput.constants";
import type { ScriptInputProps } from "./ScriptInput.types";

// CodeMirror y su gramatica de JavaScript pesan mas que varios paneles juntos y no sirven de nada
// hasta que alguien abre la pestaña de logica, asi que van detras de un lazy. El textarea es el
// respaldo mientras baja el chunk: es el mismo control que habia antes, no un cartel de espera.
const ScriptEditor = lazy(() =>
  import("../ScriptEditor/ScriptEditor").then((module) => ({ default: module.ScriptEditor })),
);

export function ScriptInput({
  id,
  label,
  value,
  rows = 6,
  maxRows = 18,
  knownNames,
  placeholder,
  insertCandidates,
  onChange,
}: ScriptInputProps) {
  // Al editor se le pide alto en vez de filas: 12px con interlineado 1.6 son 1.2rem por linea, mas
  // un respiro para el relleno vertical.
  const alto = (lines: number): string => `${(lines * 1.2 + 0.75).toFixed(2)}rem`;

  const minHeight: string = alto(rows);

  // El maximo nunca queda por debajo del minimo: si alguien pide mas filas que el techo, el techo
  // cede. Al reves el editor naceria recortado, mostrando menos de lo que se le pidio.
  const maxHeight: string = alto(Math.max(rows, maxRows));

  // Inserta al final y no en el cursor. Dentro del editor el camino bueno es escribir "{" y elegir
  // del desplegable; esto queda como via visible para el que no sabe que existe.
  function insertRef(name: string): void {
    if (name.length === 0) return;

    const separator: string = value.length === 0 || value.endsWith("\n") ? "" : " ";
    onChange(`${value}${separator}{${name}}`);
  }

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>

      <Suspense
        fallback={
          <textarea
            id={id}
            rows={rows}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            className={SCRIPT_TEXTAREA_CLASSES}
          />
        }
      >
        <ScriptEditor
          id={id}
          ariaLabel={label}
          value={value}
          knownNames={knownNames}
          placeholder={placeholder}
          minHeight={minHeight}
          maxHeight={maxHeight}
          onChange={onChange}
        />
      </Suspense>

      {insertCandidates && insertCandidates.length > 0 && (
        <select
          value=""
          onChange={(event) => insertRef(event.target.value)}
          className={SCRIPT_SELECT_CLASSES}
          aria-label="Insertar campo en el script"
        >
          <option value="">+ Insertar campo…</option>
          {insertCandidates.map((candidate) => (
            <option key={candidate.id} value={candidate.name}>
              {candidate.label} · {candidate.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
