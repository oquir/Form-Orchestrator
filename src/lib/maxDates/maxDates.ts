import type {
  DeclaracionKind,
  FechasMaximasPresentacion,
  Periodicidad,
  ReglaAnio,
  TipoDigitoValidacion,
} from "../../types/maxDates";
import {
  ANIOS_POR_DEFECTO,
  DIGITOS,
  MES_DIA_ICA,
  OFFSET_ICA,
  PERIODOS_POR_PERIODICIDAD,
} from "./maxDates.constants";

// Las reglas de las fechas maximas de presentacion: cuantos periodos tiene un ano, como se arma la
// tabla por defecto y como se busca una fecha puntual. Busqueda y aritmetica puras, sin React ni
// store, igual que rowLayout o fieldRounding.

const UN_DIGITO: RegExp = /^[0-9]$/;

export function periodosDe(periodicidad: Periodicidad): number {
  return PERIODOS_POR_PERIODICIDAD[periodicidad];
}

// Cuantas fechas deberia traer un ano segun lo que declara. Sirve para ver de un vistazo que un
// volcado llego incompleto, que es la falla que de otro modo aparece recien el dia que alguien
// consulta justo el periodo que falta.
export function fechasEsperadas(regla: ReglaAnio): number {
  return periodosDe(regla.periodicidad) * (regla.tipoDigito === "ninguno" ? 1 : DIGITOS);
}

// El digito del documento sobre el que se valida, o null si no hay ninguno legible ahi.
//
// Devolver null y no un numero es lo que arregla dos fallas mudas del primer boceto: Number("") da
// 0, asi que un documento vacio elegia la fecha del digito 0 -- una fecha equivocada con cara de
// correcta -- y un NIT con letra daba NaN, que no coincide con nada y se iba sin decir por que.
export function digitoDe(
  documento: string,
  tipo: Exclude<TipoDigitoValidacion, "ninguno">,
): number | null {
  const limpio: string = documento.trim();
  if (limpio.length === 0) return null;

  const char: string = tipo === "primer_digito" ? limpio[0] : limpio[limpio.length - 1];

  return UN_DIGITO.test(char) ? Number(char) : null;
}

export function buscarFechaLimite(
  reglas: ReglaAnio[],
  anio: number,
  periodo: number,
  documento: string,
): string | undefined {
  const regla: ReglaAnio | undefined = reglas.find((r) => r.anio === anio);
  if (!regla) return undefined;

  if (regla.tipoDigito === "ninguno") {
    return regla.fechas.find((f) => f.periodo === periodo)?.fecha;
  }

  const digito: number | null = digitoDe(documento, regla.tipoDigito);
  if (digito === null) return undefined;

  return regla.fechas.find((f) => f.periodo === periodo && f.digito === digito)?.fecha;
}

// Los `cantidad` anos gravables mas recientes que se pueden declarar, uno por ano y sin digito. El
// desplazamiento hace las dos cosas a la vez: corre cual es el ultimo ano declarable y sobre que
// ano cae su vencimiento. Con offset 1 y ano en curso 2026 salen los gravables 2016 a 2025, el
// ultimo venciendo en 2026.
export function generarReglasAnuales(
  anioActual: number,
  cantidad: number,
  offset: number,
  mesDia: string,
): ReglaAnio[] {
  const reglas: ReglaAnio[] = [];
  const ultimo: number = anioActual - offset;

  for (let anio = ultimo - cantidad + 1; anio <= ultimo; anio += 1) {
    reglas.push({
      anio,
      periodicidad: "anual",
      tipoDigito: "ninguno",
      fechas: [{ periodo: 1, fecha: `${anio + offset}/${mesDia}` }],
    });
  }

  return reglas;
}

// Cambia la fecha de un ano anual, devolviendo una tabla nueva. Solo toca el periodo 1 y solo de
// los anos sin digito: es el unico caso que el panel deja editar a mano, porque los demas son de 6
// a 120 fechas y eso se carga pegando, no tecleando.
export function conFechaAnual(
  fechas: FechasMaximasPresentacion,
  kind: DeclaracionKind,
  anio: number,
  nueva: string,
): FechasMaximasPresentacion {
  return {
    ...fechas,
    [kind]: fechas[kind].map((regla) =>
      regla.anio === anio && regla.periodicidad === "anual" && regla.tipoDigito === "ninguno"
        ? { ...regla, fechas: [{ periodo: 1, fecha: nueva }] }
        : regla,
    ),
  };
}

// Retencion y autorretencion salen vacias a proposito. El builder solo trae plantilla de industria
// y comercio, y sus fechas son bimestrales o mensuales segun el municipio: generarlas seria dar por
// buenos unos datos que nadie dio, la misma razon por la que no se inventan tarifas. La estructura
// ya esta, asi que cargarlas es pegar el volcado.
export function generarFechasPorDefecto(anioActual: number): FechasMaximasPresentacion {
  return {
    municipioId: "",
    ica: generarReglasAnuales(anioActual, ANIOS_POR_DEFECTO, OFFSET_ICA, MES_DIA_ICA),
    reteica: [],
    autoretencionIca: [],
  };
}
