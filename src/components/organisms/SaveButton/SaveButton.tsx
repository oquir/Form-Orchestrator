import { Check, Save22 } from "reicon-react";
import { useSaveButton } from "../../../hooks/useSaveButton/useSaveButton";
import { SAVE_BUTTON_BASE_CLASSES, SAVE_BUTTON_STATE_CLASSES } from "./SaveButton.constants";

export function SaveButton() {
  const { lastSavedAt, justSaved, handleSave } = useSaveButton();

  // El sello de hora viaja en el title y no como segunda linea: el boton vive en la fila de
  // acciones de la cabecera del panel, donde no hay lugar para dos renglones y donde un texto que
  // aparece y desaparece movería a los botones vecinos.
  const savedLabel: string = lastSavedAt
    ? `Guardado ${new Date(lastSavedAt).toLocaleTimeString()}`
    : "Todavía sin guardar";

  return (
    <button
      type="button"
      onClick={handleSave}
      title={savedLabel}
      className={`${SAVE_BUTTON_BASE_CLASSES} ${
        justSaved ? SAVE_BUTTON_STATE_CLASSES.saved : SAVE_BUTTON_STATE_CLASSES.idle
      }`}
    >
      {justSaved ? (
        <>
          <Check size={13} weight="Filled" /> Guardado
        </>
      ) : (
        <>
          <Save22 size={13} /> Guardar
        </>
      )}
    </button>
  );
}
