import type { ExportedFormSchema, ExportedSetupConfig, ExportedStep } from "../../types/exportForm";
import { FORM_SCHEMA_KEYS, SETUP_CONFIG_KEYS } from "./formRequires.constants";
import { declareHelpers, declareKeys, declareStep } from "./formRequires.utils";

// Lo que un consumidor tiene que saber hacer para ejecutar ESTE formulario sin perder nada en
// silencio. Viaja en projectMeta.requires, y un consumidor que no reconoce alguna palabra se niega
// a cargar el formulario en vez de dibujarlo a medias.
//
// Una lista y no un numero de version: un numero bloquearia tambien un formulario viejo que no usa
// nada nuevo. La lista solo frena lo que de verdad no se sabe hacer.
//
// Se calcula sobre el export ya armado y no sobre el modelo, porque juzga lo que viaja: un tooltip
// vacio o una comprobacion apagada no salen en el JSON, asi que tampoco pueden pedir nada.
//
// Dos clases de palabras:
// - claves, como "alcance.clave": field.prefix, group.checks. Salen de las tablas de
//   formRequires.constants, que el compilador obliga a mantener completas.
// - valores de una lista cerrada sobre la que el consumidor decide, como "categoria:valor":
//   type:date, operator:matches, helper:uvt, catalog:ciudades.

export function collectRequires(
  setupConfig: ExportedSetupConfig,
  formSchema: ExportedFormSchema,
): string[] {
  const words: Set<string> = new Set();

  declareKeys(words, "setupConfig", setupConfig, SETUP_CONFIG_KEYS);
  declareKeys(words, "formSchema", formSchema, FORM_SCHEMA_KEYS);

  // El preludio no va dentro de cada `compiled`, asi que sus helpers se buscan aparte.
  if (formSchema.prelude) declareHelpers(words, formSchema.prelude);

  // El modal de entrada corre en el mismo ambito que el formulario: lo que pida tambien cuenta.
  const steps: ExportedStep[] = [...(setupConfig.introModal?.steps ?? []), ...formSchema.steps];

  for (const step of steps) {
    declareStep(words, step);
  }

  // Ordenada para que dos exports del mismo formulario den la misma lista y un diff muestre solo
  // lo que cambio.
  return [...words].sort();
}
