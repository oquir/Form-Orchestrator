import { Label } from "../../atoms/Label/Label";
import { SCRIPT_SELECT_CLASSES, SCRIPT_TEXTAREA_CLASSES } from "./ScriptInput.constants";
import type { ScriptInputProps } from "./ScriptInput.types";

// El widget donde se escribe el codigo, sin nada de validacion: quien lo usa decide que mensajes
// mostrar. Es el unico punto que hay que cambiar para pasar a un editor de verdad.
export function ScriptInput({
  id,
  label,
  value,
  rows = 6,
  placeholder,
  insertCandidates,
  onChange,
}: ScriptInputProps) {
  // Inserta al final y no en el cursor: un textarea no expone la seleccion sin guardarla a mano, y
  // esto es exactamente lo que hace hoy el insertador de formulas.
  function insertRef(name: string): void {
    if (name.length === 0) return;

    const separator: string = value.length === 0 || value.endsWith("\n") ? "" : " ";
    onChange(`${value}${separator}{${name}}`);
  }

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>

      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className={SCRIPT_TEXTAREA_CLASSES}
      />

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
