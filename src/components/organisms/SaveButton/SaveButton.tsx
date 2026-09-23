import { Check, Floppy2 } from "reicon-react";
import { useSaveButton } from "../../../hooks/useSaveButton/useSaveButton";
import { SAVE_BUTTON_BASE_CLASSES, SAVE_BUTTON_STATE_CLASSES } from "./SaveButton.constants";
import type { SaveButtonProps } from "./SaveButton.types";

export function SaveButton({ iconOnly = false }: SaveButtonProps) {
  const { lastSavedAt, justSaved, handleSave } = useSaveButton();

  // El sello de hora viaja en el title y no como segunda linea: el boton vive en la fila de
  // acciones de la cabecera del panel, donde no hay lugar para dos renglones y donde un texto que
  // aparece y desaparece movería a los botones vecinos. Sin etiqueta el title es lo unico que
  // nombra el boton, asi que tambien hace de aria-label.
  const savedLabel: string = lastSavedAt
    ? `Guardar · guardado ${new Date(lastSavedAt).toLocaleTimeString()}`
    : "Guardar · todavía sin guardar";

  return (
    <button
      type="button"
      onClick={handleSave}
      title={savedLabel}
      aria-label={iconOnly ? savedLabel : undefined}
      className={`${SAVE_BUTTON_BASE_CLASSES} ${
        justSaved ? SAVE_BUTTON_STATE_CLASSES.saved : SAVE_BUTTON_STATE_CLASSES.idle
      }`}
    >
      {justSaved ? <Check size={13} weight="Filled" /> : <Floppy2 size={13} />}
      {!iconOnly && (justSaved ? "Guardado" : "Guardar")}
    </button>
  );
}
