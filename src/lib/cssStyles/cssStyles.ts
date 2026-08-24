import type { CssStyleMap, FieldStyles, FieldTooltip } from "../../types/field";
import type { RowStyles } from "../../types/formStructure";
import { splitDeclarations, toCamelCase } from "./cssStyles.utils";

// Traduce el CSS que el autor escribe a mano (el modelo) al objeto plano que el `style` de React
// espera (el contrato de salida). Reemplaza a las clases de Tailwind: el consumidor no tiene este
// codigo fuente escaneado por Tailwind, asi que una clase solo se aplicaria ahi por casualidad
// -- medido, la mitad funcionaba y la mitad no, el peor modo de fallar. No hay saneado: el `style`
// de React no ejecuta nada, solo asigna propiedades e ignora en silencio las invalidas, y la
// frontera de confianza del archivo ya la puso `logic.script` con `new Function`.

// Parte por `;`, ignora comentarios y lo que no tenga forma "propiedad: valor". El indexOf del
// primer ":" es a proposito: un valor como "url(http://x.png)" tiene sus propios ":" que no hay
// que partir.
export function parseCssText(text: string): CssStyleMap {
  const result: CssStyleMap = {};

  for (const declaration of splitDeclarations(text)) {
    const separatorIndex: number = declaration.indexOf(":");
    if (separatorIndex <= 0) continue;

    const property: string = declaration.slice(0, separatorIndex).trim();
    const value: string = declaration.slice(separatorIndex + 1).trim();
    if (!property || !value) continue;

    result[toCamelCase(property)] = value;
  }

  return result;
}

// El texto libre gana: es la cascada normal de CSS -- la ultima declaracion manda -- y es lo que
// hace que el lienzo pinte lo mismo que va a pintar el consumidor. Solo se usa al exportar; el
// lienzo divide el campo en dos elementos (ver CanvasFieldChip) y aplica esta misma funcion sobre
// la caja pintada, nunca sobre la que lleva `gridColumn`.
export function resolveFieldStyles(styles: FieldStyles): CssStyleMap {
  const merged: CssStyleMap = {};

  if (styles.marginTop) merged.marginTop = styles.marginTop;
  if (styles.marginBottom) merged.marginBottom = styles.marginBottom;
  if (styles.backgroundColor) merged.backgroundColor = styles.backgroundColor;
  if (styles.textColor) merged.color = styles.textColor;

  return { ...merged, ...parseCssText(styles.customCss ?? "") };
}

// undefined cuando no hay nada que decir, para que la fila siga sin clave `styles` en el JSON --
// misma razon por la que ExportedRow.styles es opcional y ExportedField.styles no.
export function resolveRowStyles(styles: RowStyles | undefined): CssStyleMap | undefined {
  if (!styles) return undefined;

  const merged: CssStyleMap = {};
  if (styles.marginTop) merged.marginTop = styles.marginTop;
  if (styles.marginBottom) merged.marginBottom = styles.marginBottom;

  const resolved: CssStyleMap = { ...merged, ...parseCssText(styles.customCss ?? "") };

  return Object.keys(resolved).length > 0 ? resolved : undefined;
}

export function resolveTooltipStyles(tooltip: FieldTooltip): CssStyleMap {
  return parseCssText(tooltip.customCss ?? "");
}

// Las declaraciones que el navegador no reconoce, para avisar donde se escriben sin bloquear --
// misma regla que un {campo} desconocido en un script. CSS.supports es API de navegador: falta en
// un script de verificacion con tsx, y sin la guarda ahi explotaria.
export function unsupportedDeclarations(text: string): string[] {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return [];

  const unsupported: string[] = [];

  for (const declaration of splitDeclarations(text)) {
    const separatorIndex: number = declaration.indexOf(":");
    if (separatorIndex <= 0) continue;

    const property: string = declaration.slice(0, separatorIndex).trim();
    const value: string = declaration.slice(separatorIndex + 1).trim();
    if (!property || !value) continue;

    if (!CSS.supports(property, value)) unsupported.push(declaration);
  }

  return unsupported;
}
