// El multiplo esta clavado aca y no en el campo a proposito: en los formularios que existen nunca
// aparecio otro redondeo que no fuera al millar mas cercano, asi que un multiplo configurable
// habria sido una decision de mas en cada campo y una opcion que nadie iba a usar. Si algun dia
// hace falta otro, esta constante es el unico lugar que cambia.
export const ROUNDING_MULTIPLE: number = 1000;
