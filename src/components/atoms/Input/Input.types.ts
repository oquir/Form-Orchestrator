import type { InputHTMLAttributes } from "react";

// "code" para lo que se escribe como codigo y no como texto: expresiones regulares, rutas. Va como
// prop y no como className porque el color de texto ya lo pone el propio Input, y dos utilidades de
// color en la misma clase las resuelve el orden de la hoja de estilos, no el orden en que se pasan.
export type InputTone = "default" | "code";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  tone?: InputTone;
}
