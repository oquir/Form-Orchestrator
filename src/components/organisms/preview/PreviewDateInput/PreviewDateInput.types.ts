import type { DateFormatId } from "../../../../types/fieldDate";

export interface PreviewDateInputProps {
  id?: string;
  ariaLabel?: string;
  // Sin formato es el input del navegador; con formato, un texto con mascara y el calendario aparte.
  format: DateFormatId | undefined;
  withTime: boolean;
  // Siempre el valor interno (AAAA-MM-DD), o el texto a medio escribir mientras no este completo.
  value: string;
  min?: string;
  max: string;
  disabled: boolean;
  // Las clases las arma PreviewFieldControl, que ya sabe si el campo esta en rojo.
  className: string;
  onChange: (value: string) => void;
}
