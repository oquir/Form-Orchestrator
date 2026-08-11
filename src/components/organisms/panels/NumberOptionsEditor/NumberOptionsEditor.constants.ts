// Se ofrece una lista y no un input libre por la misma razon que el catalogo se elige de CATALOGS:
// un 17 tecleado de mas no falla, solo produce un campo raro que nadie revisa. El tope coincide
// con MAX_DISPLAY_DECIMALS, que es hasta donde formatNumber muestra sin declaracion.
export const DECIMAL_CHOICES: number[] = [0, 1, 2, 3, 4];
