export const MENU_WIDTH_PX: number = 338;
export const VIEWPORT_MARGIN_PX: number = 8;

// Techo del menu como fraccion de la ventana. Vive aca y no como una clase max-h-[80vh] en el
// componente porque el calculo de la posicion necesita el mismo numero: mientras el ancla y el
// alto maximo salgan de fuentes distintas, el menu puede anclarse mas abajo de lo que su propio
// alto permite y desbordar la pantalla.
export const MENU_MAX_HEIGHT_RATIO: number = 0.8;

// Por debajo de esto el menu deja de servir, asi que cerca del borde inferior se sube en vez de
// seguir encogiendolo.
export const MENU_MIN_HEIGHT_PX: number = 240;
