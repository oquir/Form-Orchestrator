// La convencion colombiana: el punto agrupa de a miles y la coma separa los decimales. Van como
// constantes y no sueltas en el codigo porque el formateador y el parser tienen que leer las
// mismas dos: si se desincronizan, lo que se muestra deja de poder volver a entrar.
export const GROUP_SEPARATOR: string = ".";

export const DECIMAL_SEPARATOR: string = ",";

// Tope de decimales al mostrar. Sin el, un script que haga 0.1 + 0.2 pinta 0,30000000000000004 en
// pantalla: la coma flotante binaria no representa esos valores exactos y el usuario ve la basura.
// Cuatro alcanza de sobra para cualquier tarifa y corta la cola.
export const MAX_DISPLAY_DECIMALS: number = 4;

// Arriba de 1e21 toFixed devuelve notacion exponencial y el agrupado saldria hecho un desastre.
// No es un valor que una declaracion vaya a tener; la guarda existe para que un script con un bug
// no pinte "1e+21" agrupado de a tres.
export const MAX_FORMATTABLE: number = 1e21;
