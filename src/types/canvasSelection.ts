// Un rectangulo por sus cuatro bordes y no por origen y tamano: intersectar dos es comparar bordes,
// y un marco arrastrado hacia arriba o hacia la izquierda no tiene que lidiar con anchos negativos.
export interface SelectionRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
