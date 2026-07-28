export function getOptionsHint(fieldType: string, isRequired: boolean): string {
  if (fieldType === "radio_group") {
    return "Una vez marcada una opción no se puede deseleccionar, a diferencia de los Toggle Buttons.";
  }

  if (fieldType === "toggle_group") {
    return isRequired
      ? "Campo requerido: siempre quedará una opción seleccionada."
      : 'Campo opcional: se mostrará un botón de "Limpiar selección".';
  }

  return isRequired
    ? "Campo requerido: el usuario deberá elegir una opción de la lista."
    : "Campo opcional: la lista podrá quedar sin selección.";
}
