import type { SchemaNode, SchemaNodeType } from "../../types/payloadSchema";

function scalar(key: string, type: Exclude<SchemaNodeType, "object" | "array">): SchemaNode {
  return { key, type };
}

function object(key: string, children: SchemaNode[]): SchemaNode {
  return { key, type: "object", children };
}

function array(key: string, items: SchemaNode): SchemaNode {
  return { key, type: "array", items };
}

const contribuyente: SchemaNode = object("contribuyente", [
  scalar("codigoMunicipio", "string"),
  scalar("idTipoDocumento", "number"),
  scalar("idTipoPersona", "number"),
  scalar("numeroDocumento", "string"),
  scalar("digitoVerificacion", "number"),
  scalar("primerNombre", "string"),
  scalar("segundoNombre", "string"),
  scalar("primerApellido", "string"),
  scalar("segundoApellido", "string"),
  scalar("nombreCompleto", "string"),
  scalar("idCiudad", "number"),
  scalar("direccion", "string"),
  scalar("correo", "string"),
  scalar("telefono", "string"),
  scalar("numeroEstablecimiento", "number"),
  scalar("idClasificacionMunicipio", "number"),
]);

const baseGravable: SchemaNode = object("baseGravable", [
  scalar("totalIngresosNacionales", "number"),
  scalar("ingresosFueraMunicipio", "number"),
  scalar("totalIngresosOrdinarios", "number"),
  scalar("ingresosDevolucionesDescuentos", "number"),
  scalar("ingresosExportaciones", "number"),
  scalar("ingresosVentaActivos", "number"),
  scalar("ingresosExcluidosNoGravados", "number"),
  scalar("ingresosExentosMunicipio", "number"),
  scalar("totalIngresosGravables", "number"),
]);

const actividades: SchemaNode = array(
  "actividades",
  object("item", [
    scalar("idDeclaracion", "number"),
    scalar("idActividad", "number"),
    scalar("ingresoGravado", "number"),
    scalar("tarifaXMil", "number"),
    scalar("valorImpuestoActividad", "number"),
  ]),
);

const impuestoACargo: SchemaNode = object("impuestoACargo", [
  scalar("impuestoAvisosTableros", "number"),
  scalar("pagoUnidadesSectorFinanciero", "number"),
  scalar("sobretasaBomberil", "number"),
  scalar("idTipoJuegoPermitido", "number"),
  scalar("impuestoJuegoPermitido", "number"),
  scalar("sobretasaSeguridad", "number"),
  scalar("estampillaSistematizacion", "number"),
  scalar("totalImpuestoACargo", "number"),
]);

const ajusteDeclaracion: SchemaNode = object("ajusteDeclaracion", [
  scalar("valorExencionExoneracionImpuesto", "number"),
  scalar("retencionesAFavor", "number"),
  scalar("autoretencionesAFavor", "number"),
  scalar("anticipoLiquidadoAnioAnterior", "number"),
  scalar("anticipoAnioSiguiente", "number"),
  scalar("idTipoSancion", "number"),
  scalar("descripcionSancion", "string"),
  scalar("valorSancion", "number"),
  scalar("saldoFavorPeriodoAnterior", "number"),
  scalar("saldoPagosRecibidos", "number"),
  scalar("totalAjusteDeclaracion", "number"),
]);

const totalDeclaracion: SchemaNode = object("totalDeclaracion", [
  scalar("totalSaldoACargo", "number"),
  scalar("totalSaldoAFavor", "number"),
  scalar("descuentoProntoPago", "number"),
  scalar("interesMora", "number"),
  scalar("valorAporteVoluntario", "number"),
  scalar("totalDeclaracion", "number"),
]);

const declarante: SchemaNode = object("declarante", [
  scalar("idTipoDocumento", "number"),
  scalar("numeroDocumento", "string"),
  scalar("nombreCompleto", "string"),
]);

const responsableLegal: SchemaNode = object("responsableLegal", [
  scalar("idTipoRepresentante", "number"),
  scalar("idTipoDocumento", "number"),
  scalar("numeroDocumento", "string"),
  scalar("primerNombre", "string"),
  scalar("segundoNombre", "string"),
  scalar("primerApellido", "string"),
  scalar("segundoApellido", "string"),
  scalar("celular", "string"),
  scalar("correoElectronico", "string"),
  scalar("nroTarjetaProfesional", "string"),
]);

export const PAYLOAD_SCHEMA: SchemaNode = object("root", [
  scalar("idTipoDeclaracion", "number"),
  scalar("numeroRadicado", "number"),
  contribuyente,
  scalar("periodoAnio", "number"),
  scalar("idPeriodoAnual", "number"),
  baseGravable,
  actividades,
  scalar("generacionEnergiaKw", "number"),
  scalar("impuestoLey56", "number"),
  impuestoACargo,
  ajusteDeclaracion,
  totalDeclaracion,
  scalar("descripcionAporteVoluntario", "string"),
  declarante,
  responsableLegal,
]);
