import { v4 as uuidv4 } from "uuid";
import { GRID_BASE_COLUMNS } from "../../constants/grid";
import type { ApiBinding, CanvasField } from "../../types/field";
import type { CanvasRow, FormStep, IntroModalStep } from "../../types/formStructure";

export type IntroStepTemplate = Omit<IntroModalStep, "stepId">;
export type FormStepTemplate = Omit<FormStep, "stepId">;

export const INDUSTRIA_COMERCIO_FORM_STEPS: number = 8;
export const INDUSTRIA_COMERCIO_INTRO_STEPS: number = 2;

interface FieldSpec {
  name: string;
  type: string;
  label: string;
  colSpan: number;
  path?: string;
  excluded?: boolean;
  required?: boolean;
  min?: number;
  formula?: string;
}

const SALDO_NETO: string =
  "total_impuesto_a_cargo - valor_exencion_exoneracion_impuesto - retenciones_a_favor - autorretenciones_a_favor - anticipo_liquidado_anio_anterior + anticipo_anio_siguiente + valor_sancion - saldo_favor_periodo_anterior";

function bindingFor(spec: FieldSpec): ApiBinding | undefined {
  if (spec.path !== undefined) return { kind: "mapped", path: spec.path };
  if (spec.excluded) return { kind: "excluded" };

  return undefined;
}

function buildRow(specs: FieldSpec[]): CanvasRow {
  const fields: CanvasField[] = [];
  let colStart = 1;

  for (const spec of specs) {
    fields.push({
      id: uuidv4(),
      name: spec.name,
      type: spec.type,
      label: spec.label,
      colStart,
      colSpan: spec.colSpan,
      validations: {
        ...(spec.required ? { required: true } : {}),
        ...(spec.min === undefined ? {} : { min: spec.min }),
      },
      styles: {},
      logic: { dependencies: [], typeScript: "", formula: spec.formula },
      apiBinding: bindingFor(spec),
    });

    colStart += spec.colSpan;
  }

  return { id: uuidv4(), columns: GRID_BASE_COLUMNS, fields };
}

export function getIndustriaComercioIntroTemplate(): IntroStepTemplate[] {
  return [
    {
      title: "Seleccione año gravable y período",
      subtitle: "Complete los datos iniciales para continuar con la declaración.",
      rows: [
        buildRow([
          {
            name: "periodo_anio",
            type: "select",
            label: "Año gravable",
            colSpan: GRID_BASE_COLUMNS,
            path: "periodoAnio",
            required: true,
          },
        ]),
        buildRow([
          {
            name: "id_periodo_anual",
            type: "toggle_group",
            label: "Periodos",
            colSpan: GRID_BASE_COLUMNS,
            path: "idPeriodoAnual",
            required: true,
          },
        ]),
      ],
    },
    {
      title: "Seleccione tipo de declaración",
      subtitle: "Elija el tipo de declaración que corresponde al flujo actual.",
      rows: [
        buildRow([
          {
            name: "id_tipo_declaracion",
            type: "select",
            label: "Tipo de declaración",
            colSpan: GRID_BASE_COLUMNS,
            path: "idTipoDeclaracion",
            required: true,
          },
        ]),
      ],
    },
  ];
}

export function getIndustriaComercioFormTemplate(): FormStepTemplate[] {
  return [
    {
      title: "Datos",
      subtitle: "Contribuyente",
      rows: [
        buildRow([
          {
            name: "tipo_documento",
            type: "select",
            label: "Tipo de documento",
            colSpan: 6,
            path: "contribuyente.idTipoDocumento",
            required: true,
          },
          {
            name: "numero_documento",
            type: "text",
            label: "Número de documento",
            colSpan: 7,
            path: "contribuyente.numeroDocumento",
            required: true,
          },
          {
            name: "dv",
            type: "number",
            label: "DV",
            colSpan: 3,
            path: "contribuyente.digitoVerificacion",
            required: true,
          },
        ]),
        buildRow([
          {
            name: "primer_nombre",
            type: "text",
            label: "Primer nombre",
            colSpan: 4,
            path: "contribuyente.primerNombre",
            required: true,
          },
          {
            name: "segundo_nombre",
            type: "text",
            label: "Segundo nombre",
            colSpan: 4,
            path: "contribuyente.segundoNombre",
          },
          {
            name: "primer_apellido",
            type: "text",
            label: "Primer apellido",
            colSpan: 4,
            path: "contribuyente.primerApellido",
            required: true,
          },
          {
            name: "segundo_apellido",
            type: "text",
            label: "Segundo apellido",
            colSpan: 4,
            path: "contribuyente.segundoApellido",
          },
        ]),
        buildRow([
          {
            name: "direccion",
            type: "text",
            label: "Dirección",
            colSpan: 6,
            path: "contribuyente.direccion",
            required: true,
          },
          {
            name: "departamento",
            type: "select",
            label: "Departamento",
            colSpan: 5,
            required: true,
          },
          {
            name: "municipio",
            type: "select",
            label: "Municipio",
            colSpan: 5,
            path: "contribuyente.idCiudad",
            required: true,
          },
        ]),
        buildRow([
          {
            name: "telefono_celular",
            type: "text",
            label: "Teléfono celular",
            colSpan: 8,
            path: "contribuyente.telefono",
            required: true,
          },
          {
            name: "correo_electronico",
            type: "text",
            label: "Correo electrónico",
            colSpan: 8,
            path: "contribuyente.correo",
            required: true,
          },
        ]),
        buildRow([
          {
            name: "numero_establecimientos",
            type: "number",
            label: "Número de establecimientos",
            colSpan: 8,
            path: "contribuyente.numeroEstablecimiento",
            required: true,
            min: 0,
          },
          {
            name: "clasificacion_contribuyente",
            type: "select",
            label: "Clasificación contribuyente",
            colSpan: 8,
            path: "contribuyente.idClasificacionMunicipio",
            required: true,
          },
        ]),
      ],
    },
    {
      title: "Base gravable",
      rows: [
        buildRow([
          {
            name: "total_ingresos_nacionales",
            type: "number",
            label: "8. Total Ingresos Ordinarios y Extraordinarios del Periodo en Todo el País",
            colSpan: GRID_BASE_COLUMNS,
            path: "baseGravable.totalIngresosNacionales",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "ingresos_fuera_municipio",
            type: "number",
            label: "9. menos: Ingresos Fuera de Este Municipio o Distrito",
            colSpan: GRID_BASE_COLUMNS,
            path: "baseGravable.ingresosFueraMunicipio",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "total_ingresos_ordinarios",
            type: "number",
            label:
              "10. Total Ingresos Ordinarios y Extraordinarios en Este Municipio (Renglón 8-9)",
            colSpan: GRID_BASE_COLUMNS,
            path: "baseGravable.totalIngresosOrdinarios",
            formula: "total_ingresos_nacionales - ingresos_fuera_municipio",
          },
        ]),
        buildRow([
          {
            name: "ingresos_devoluciones_descuentos",
            type: "number",
            label: "11. menos: Ingresos Por Devolución, Rebajas, Descuentos",
            colSpan: GRID_BASE_COLUMNS,
            path: "baseGravable.ingresosDevolucionesDescuentos",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "ingresos_exportaciones",
            type: "number",
            label: "12. menos: Ingresos Por Exportaciones",
            colSpan: GRID_BASE_COLUMNS,
            path: "baseGravable.ingresosExportaciones",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "ingresos_venta_activos",
            type: "number",
            label: "13. menos: Ingresos Por Venta de Activos Fijos",
            colSpan: GRID_BASE_COLUMNS,
            path: "baseGravable.ingresosVentaActivos",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "ingresos_excluidos_no_gravados",
            type: "number",
            label:
              "14. menos: Ingresos Por Actividades Excluidas o No Sujetas y Otros Ingresos No Gravados",
            colSpan: GRID_BASE_COLUMNS,
            path: "baseGravable.ingresosExcluidosNoGravados",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "ingresos_exentos_municipio",
            type: "number",
            label:
              "15. menos: Ingresos Por Otras Actividades Exentas en Este Municipio o Distrito (Por Acuerdo)",
            colSpan: GRID_BASE_COLUMNS,
            path: "baseGravable.ingresosExentosMunicipio",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "total_ingresos_gravables",
            type: "number",
            label: "16. TOTAL INGRESOS GRAVABLES (Renglón 10 Menos 11, 12, 13, 14 y 15)",
            colSpan: GRID_BASE_COLUMNS,
            path: "baseGravable.totalIngresosGravables",
            formula:
              "total_ingresos_ordinarios - ingresos_devoluciones_descuentos - ingresos_exportaciones - ingresos_venta_activos - ingresos_excluidos_no_gravados - ingresos_exentos_municipio",
          },
        ]),
      ],
    },
    {
      title: "Actividades gravadas",
      rows: [buildRow([])],
    },
    {
      title: "Impuesto a cargo",
      rows: [
        buildRow([
          {
            name: "total_impuesto",
            type: "number",
            label: "17. Total Impuesto",
            colSpan: GRID_BASE_COLUMNS,
            excluded: true,
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "generacion_energia_kw",
            type: "number",
            label: "18. Generación de Energía / Capacidad Instalada",
            colSpan: GRID_BASE_COLUMNS,
            path: "generacionEnergiaKw",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "impuesto_ley_56",
            type: "number",
            label: "19. Impuesto Ley 56 1981",
            colSpan: GRID_BASE_COLUMNS,
            path: "impuestoLey56",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "total_impuesto_industria_comercio",
            type: "number",
            label: "20. Total Impuesto de Industria y Comercio (Renglón 17 + 19)",
            colSpan: GRID_BASE_COLUMNS,
            excluded: true,
            formula: "total_impuesto + impuesto_ley_56",
          },
        ]),
        buildRow([
          {
            name: "impuesto_avisos_tableros",
            type: "number",
            label: "21. Impuesto de Avisos y Tableros (15% Renglón 20)",
            colSpan: GRID_BASE_COLUMNS,
            path: "impuestoACargo.impuestoAvisosTableros",
            formula: "total_impuesto_industria_comercio * 0.15",
          },
        ]),
        buildRow([
          {
            name: "pago_unidades_sector_financiero",
            type: "number",
            label: "22. Pago Por Unidades Comerciales Adicionales del Sector Financiero",
            colSpan: GRID_BASE_COLUMNS,
            path: "impuestoACargo.pagoUnidadesSectorFinanciero",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "sobretasa_bomberil",
            type: "number",
            label:
              "23. Sobretasa Bomberil (Ley 1575 de 2012) (Si la hay, Liquídela Según el Acuerdo Municipal o Distrital)",
            colSpan: GRID_BASE_COLUMNS,
            path: "impuestoACargo.sobretasaBomberil",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "sobretasa_seguridad",
            type: "number",
            label:
              "24. Sobretasa de Seguridad (Ley 1421 de 2011) (Si la hay, Liquídela Según el Acuerdo Municipal o Distrital)",
            colSpan: GRID_BASE_COLUMNS,
            path: "impuestoACargo.sobretasaSeguridad",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "total_impuesto_a_cargo",
            type: "number",
            label: "25. Total Impuesto a Cargo (Renglón 20 + 21 + 22 + 23 + 24)",
            colSpan: GRID_BASE_COLUMNS,
            path: "impuestoACargo.totalImpuestoACargo",
            formula:
              "total_impuesto_industria_comercio + impuesto_avisos_tableros + pago_unidades_sector_financiero + sobretasa_bomberil + sobretasa_seguridad",
          },
        ]),
      ],
    },
    {
      title: "Deducciones, sanciones y anticipos",
      rows: [
        buildRow([
          {
            name: "valor_exencion_exoneracion_impuesto",
            type: "number",
            label:
              "26. Menos: Valor de Exención o Exoneración Sobre el Impuesto y No Sobre los Ingresos",
            colSpan: GRID_BASE_COLUMNS,
            path: "ajusteDeclaracion.valorExencionExoneracionImpuesto",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "retenciones_a_favor",
            type: "number",
            label:
              "27. Menos: Retenciones que le practicaron a favor de este municipio o distrito en este periodo",
            colSpan: GRID_BASE_COLUMNS,
            path: "ajusteDeclaracion.retencionesAFavor",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "autorretenciones_a_favor",
            type: "number",
            label:
              "28. Menos: Autorretenciones practicadas a favor de este municipio o distrito en este periodo",
            colSpan: GRID_BASE_COLUMNS,
            path: "ajusteDeclaracion.autoretencionesAFavor",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "anticipo_liquidado_anio_anterior",
            type: "number",
            label: "29. Menos: Anticipo Liquidado en el Año Anterior",
            colSpan: GRID_BASE_COLUMNS,
            path: "ajusteDeclaracion.anticipoLiquidadoAnioAnterior",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "anticipo_anio_siguiente",
            type: "number",
            label:
              "30. Anticipo del Año Siguiente (Si Existe, Liquide Porcentaje Según Acuerdo Municipal o Distrital)",
            colSpan: GRID_BASE_COLUMNS,
            path: "ajusteDeclaracion.anticipoAnioSiguiente",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "valor_sancion",
            type: "number",
            label: "31. Más: Sanciones",
            colSpan: GRID_BASE_COLUMNS,
            path: "ajusteDeclaracion.valorSancion",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "saldo_favor_periodo_anterior",
            type: "number",
            label:
              "32. Menos: Saldo a Favor del Periodo Anterior Sin Solicitud de Devolución o Compensación",
            colSpan: GRID_BASE_COLUMNS,
            path: "ajusteDeclaracion.saldoFavorPeriodoAnterior",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "total_saldo_a_cargo",
            type: "number",
            label: "33. Total Saldo a Cargo (Renglón 25 - 26 - 27 - 28 - 29 + 30 + 31 - 32)",
            colSpan: GRID_BASE_COLUMNS,
            path: "totalDeclaracion.totalSaldoACargo",
            formula: `max(${SALDO_NETO}, 0)`,
          },
        ]),
        buildRow([
          {
            name: "total_saldo_a_favor",
            type: "number",
            label:
              "34. Total Saldo a Favor (Renglón 25 - 26 - 27 - 28 - 29 + 30 + 31 - 32) si el resultado es menor a cero",
            colSpan: GRID_BASE_COLUMNS,
            path: "totalDeclaracion.totalSaldoAFavor",
            formula: `max(-(${SALDO_NETO}), 0)`,
          },
        ]),
      ],
    },
    {
      title: "Totales",
      rows: [
        buildRow([
          {
            name: "valor_a_pagar",
            type: "number",
            label: "35. Valor a Pagar",
            colSpan: GRID_BASE_COLUMNS,
            excluded: true,
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "descuento_pronto_pago",
            type: "number",
            label:
              "36. Descuento Por Pronto Pago (Si Existe, Liquídelo Según el Acuerdo Municipal o Distrital)",
            colSpan: GRID_BASE_COLUMNS,
            path: "totalDeclaracion.descuentoProntoPago",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "interes_mora",
            type: "number",
            label: "37. Más: Intereses de Mora",
            colSpan: GRID_BASE_COLUMNS,
            path: "totalDeclaracion.interesMora",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "total_a_pagar",
            type: "number",
            label: "38. Total a Pagar (Renglón 35 - 36 + 37)",
            colSpan: GRID_BASE_COLUMNS,
            path: "totalDeclaracion.totalDeclaracion",
            formula: "valor_a_pagar - descuento_pronto_pago + interes_mora",
          },
        ]),
      ],
    },
    {
      title: "Pago voluntario",
      rows: [
        buildRow([
          {
            name: "valor_aporte_voluntario",
            type: "number",
            label:
              "39. Liquide el Valor del Pago Voluntario (Según Instrucciones del Municipio/Distrito)",
            colSpan: GRID_BASE_COLUMNS,
            path: "totalDeclaracion.valorAporteVoluntario",
            required: true,
            min: 0,
          },
        ]),
        buildRow([
          {
            name: "total_a_pagar_con_aporte_voluntario",
            type: "number",
            label: "40. Total a Pagar Con Pago Voluntario (Renglón 38 + 39)",
            colSpan: GRID_BASE_COLUMNS,
            excluded: true,
            formula: "total_a_pagar + valor_aporte_voluntario",
          },
        ]),
        buildRow([
          {
            name: "destino_aporte_voluntario",
            type: "text",
            label: "Destino de Mi Aporte Voluntario",
            colSpan: GRID_BASE_COLUMNS,
            path: "descripcionAporteVoluntario",
          },
        ]),
      ],
    },
    {
      title: "Firmas",
      subtitle: "Contador/Revisor",
      rows: [
        buildRow([
          {
            name: "tipo_documento_declarante",
            type: "select",
            label: "Tipo de documento del declarante",
            colSpan: 8,
            path: "declarante.idTipoDocumento",
            required: true,
          },
          {
            name: "numero_documento_declarante",
            type: "text",
            label: "Número de documento del declarante",
            colSpan: 8,
            path: "declarante.numeroDocumento",
            required: true,
          },
        ]),
        buildRow([
          {
            name: "nombre_completo_declarante",
            type: "text",
            label: "Nombre completo del declarante",
            colSpan: GRID_BASE_COLUMNS,
            path: "declarante.nombreCompleto",
            required: true,
          },
        ]),
        buildRow([
          {
            name: "tipo_representante",
            type: "toggle_group",
            label: "Tipo de representante",
            colSpan: GRID_BASE_COLUMNS,
            path: "responsableLegal.idTipoRepresentante",
          },
        ]),
        buildRow([
          {
            name: "tipo_documento_responsable",
            type: "select",
            label: "Tipo de documento del responsable",
            colSpan: 8,
            path: "responsableLegal.idTipoDocumento",
          },
          {
            name: "numero_documento_responsable",
            type: "text",
            label: "Número de documento del responsable",
            colSpan: 8,
            path: "responsableLegal.numeroDocumento",
          },
        ]),
        buildRow([
          {
            name: "primer_nombre_responsable",
            type: "text",
            label: "Primer nombre",
            colSpan: 4,
            path: "responsableLegal.primerNombre",
          },
          {
            name: "segundo_nombre_responsable",
            type: "text",
            label: "Segundo nombre",
            colSpan: 4,
            path: "responsableLegal.segundoNombre",
          },
          {
            name: "primer_apellido_responsable",
            type: "text",
            label: "Primer apellido",
            colSpan: 4,
            path: "responsableLegal.primerApellido",
          },
          {
            name: "segundo_apellido_responsable",
            type: "text",
            label: "Segundo apellido",
            colSpan: 4,
            path: "responsableLegal.segundoApellido",
          },
        ]),
        buildRow([
          {
            name: "celular_responsable",
            type: "text",
            label: "Celular",
            colSpan: 6,
            path: "responsableLegal.celular",
          },
          {
            name: "correo_responsable",
            type: "text",
            label: "Correo electrónico",
            colSpan: 5,
            path: "responsableLegal.correoElectronico",
          },
          {
            name: "numero_tarjeta_profesional",
            type: "text",
            label: "Número de tarjeta profesional",
            colSpan: 5,
            path: "responsableLegal.nroTarjetaProfesional",
          },
        ]),
      ],
    },
  ];
}
