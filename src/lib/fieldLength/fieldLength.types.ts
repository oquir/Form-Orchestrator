// La forma del builder: el tope vive adentro de validations, junto al resto de las reglas.
export interface AuthoredLengthField {
  type: string;
  validations: { maxLength?: number };
}

// La forma exportada: el tope sale ademas como clave propia. El input lo necesita como numero, y
// adentro del texto del schema no hay como leerlo sin ponerse a parsearlo.
export interface LengthLimitedField {
  type: string;
  maxLength?: number;
}
