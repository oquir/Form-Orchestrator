// Ctrl + flecha cambia de paso. La tecla y su anuncio salen de aca, para que el atajo y el title
// de las pestanas no puedan decir cosas distintas, igual que CANVAS_TOOLS.
export const STEP_NAVIGATION_OFFSETS: Record<string, 1 | -1> = {
  ArrowLeft: -1,
  ArrowRight: 1,
};

export const STEP_NAVIGATION_HINT: string = "Ctrl+← / Ctrl+→ para cambiar de paso";
