import { v4 as uuidv4 } from "uuid";
import {
  CATALOG_ACTIVIDADES,
  CATALOG_DEPARTAMENTOS,
  CATALOG_MUNICIPIOS,
  CATALOG_PERIODOS_ANUALES,
  CATALOG_TIPOS_DECLARACION,
  CATALOG_TIPOS_DOCUMENTO,
  CATALOG_TIPOS_PERSONA,
  CATALOG_TIPOS_SANCION,
} from "../../constants/catalog";
import { GRID_BASE_COLUMNS } from "../../constants/grid";
import type {
  FormStepTemplate,
  IntroStepTemplate,
  RepeatableGroup,
} from "../../types/formStructure";
import {
  CALCULATED_WITHOUT_NEGATIVE,
  CORREO_MESSAGE,
  CORREO_PATTERN,
  DECIMALS_BY_FIELD,
  DOCUMENTO_MESSAGE,
  DOCUMENTO_PATTERN,
  FIELDS_WITHOUT_ROUNDING,
  INGRESOS_ACTIVIDADES_MESSAGE,
  INGRESOS_ACTIVIDADES_SCRIPT,
  NIT_MESSAGE,
  NIT_PATTERN,
  SALDO_NETO,
  SANCION_EXTEMPORANEIDAD_SCRIPT,
  TELEFONO_MESSAGE,
  TELEFONO_PATTERN,
  TEMPLATE_DECIMALS,
  TIPO_DOCUMENTO_NIT,
  TIPO_SANCION_OTRA,
} from "./baseTemplate.constants";
import type { TemplateCondition, TemplateValidationOverride } from "./baseTemplate.types";
import { applyNumericDefaults, buildRow, resolveTemplateConditions } from "./baseTemplate.utils";

// Los ocho pasos del formulario de industria y comercio, escritos como filas de FieldSpec.
// Es el unico tipo de formulario con plantilla; los demas arrancan con una fila vacia.
// Los renglones calculados llevan script y alwaysDisabled, y la cadena de liquidacion sube de la
// base gravable al total a pagar. SALDO_NETO es la subexpresion que comparten el 33 y el 34.

// Un NIT identifica a una persona juridica: no tiene nombres ni apellidos que capturar.
const SOLO_PERSONA_NATURAL: TemplateCondition = {
  field: "tipo_documento",
  operator: "notEquals",
  value: TIPO_DOCUMENTO_NIT,
};

const SOLO_PERSONA_JURIDICA: TemplateCondition = {
  field: "tipo_documento",
  operator: "equals",
  value: TIPO_DOCUMENTO_NIT,
};

// El maximo de digitos baja de 10 a 9 cuando el documento es un NIT. Recibe el nombre del selector
// porque cada bloque tiene el suyo: el contribuyente, el declarante y el responsable no comparten
// tipo de documento y cada override tiene que observar el de su propio bloque.
function nitOverride(tipoDocumentoField: string): TemplateValidationOverride {
  return {
    when: { field: tipoDocumentoField, operator: "equals", value: TIPO_DOCUMENTO_NIT },
    validations: { pattern: NIT_PATTERN, message: NIT_MESSAGE },
  };
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
            dataSource: { catalog: CATALOG_PERIODOS_ANUALES },
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
            dataSource: { catalog: CATALOG_TIPOS_DECLARACION },
          },
        ]),
      ],
    },
  ];
}

function buildActividadesStep(): FormStepTemplate {
  const group: RepeatableGroup = {
    id: uuidv4(),
    name: "actividades",
    title: "Otras Actividades",
    min: 1,
    max: 15,
    arrayPath: "actividades",
    // Encendida de fabrica: cuadrar es la regla y dejarlo pasar es la excepcion de los municipios
    // que prefieren cobrar la multa despues. Apagarla es una decision visible; olvidarse de
    // encenderla dejaria pasar evasion en silencio.
    checks: [
      {
        id: uuidv4(),
        label: "Ingresos de actividades contra el renglón 16",
        enabled: true,
        script: INGRESOS_ACTIVIDADES_SCRIPT,
        message: INGRESOS_ACTIVIDADES_MESSAGE,
      },
    ],
  };

  return {
    title: "Actividades gravadas",
    groups: [group],
    rows: [
      buildRow(
        [
          {
            name: "actividad",
            type: "search_select",
            label: "Actividad",
            colSpan: 10,
            path: "actividades[].idActividad",
            required: true,
            // El codigo y la tarifa no se tipean: salen de la actividad elegida. Los dos campos
            // van alwaysDisabled y se llenan solos al seleccionar, aca y en el consumidor.
            dataSource: {
              catalog: CATALOG_ACTIVIDADES,
              fills: [
                { column: "code", field: "codigo_actividad" },
                { column: "tarifa", field: "tarifa_x_mil" },
              ],
            },
          },
          {
            name: "codigo_actividad",
            type: "text",
            label: "Código",
            colSpan: 6,
            excluded: true,
            alwaysDisabled: true,
          },
        ],
        group.id,
      ),
      buildRow(
        [
          {
            name: "ingresos_gravados",
            type: "number",
            label: "Ingresos gravados",
            colSpan: 6,
            path: "actividades[].ingresoGravado",
            required: true,
            min: 0,
          },
          {
            name: "tarifa_x_mil",
            type: "number",
            label: "Tarifa X1000",
            colSpan: 5,
            path: "actividades[].tarifaXMil",
            alwaysDisabled: true,
          },
          {
            name: "impuesto_actividad",
            type: "calculated",
            label: "Impuesto",
            colSpan: 5,
            path: "actividades[].valorImpuestoActividad",
            alwaysDisabled: true,
            script: "return round({ingresos_gravados} * {tarifa_x_mil} / 1000);",
          },
        ],
        group.id,
      ),
    ],
  };
}

export function getIndustriaComercioFormTemplate(): FormStepTemplate[] {
  return applyNumericDefaults(
    resolveTemplateConditions([
      {
        title: "Datos",
        subtitle: "Contribuyente",
        rows: [
          // El catalogo se llama tipos_persona pero su endpoint es ListaTipoPersonaNoConvencional:
          // no es natural contra juridica, son consorcio o union temporal y patrimonio autonomo. De
          // ahi que el campo vaya arriba del documento y no al lado, y que no sea obligatorio: el
          // contribuyente que no es ninguna de las dos cosas lo deja sin marcar.
          buildRow([
            {
              name: "tipo_persona_no_convencional",
              type: "toggle_group",
              label: "Si no es persona natural ni persona jurídica marque",
              colSpan: GRID_BASE_COLUMNS,
              path: "contribuyente.idTipoPersona",
              dataSource: { catalog: CATALOG_TIPOS_PERSONA },
            },
          ]),
          buildRow([
            {
              name: "tipo_documento",
              type: "select",
              label: "Tipo de documento",
              colSpan: 6,
              path: "contribuyente.idTipoDocumento",
              required: true,
              dataSource: { catalog: CATALOG_TIPOS_DOCUMENTO },
            },
            {
              name: "numero_documento",
              type: "text",
              label: "Número de documento",
              colSpan: 7,
              path: "contribuyente.numeroDocumento",
              required: true,
              pattern: DOCUMENTO_PATTERN,
              message: DOCUMENTO_MESSAGE,
              validationOverrides: [nitOverride("tipo_documento")],
            },
            {
              name: "dv",
              type: "calculated",
              label: "DV",
              colSpan: 3,
              path: "contribuyente.digitoVerificacion",
              required: true,
              alwaysDisabled: true,
              // La base en 0 evita que un DV calculado quede pegado al cambiar de tipo de documento.
              script: "return 0;",
              rules: [
                {
                  label: "Digito de verificacion del NIT",
                  when: [SOLO_PERSONA_JURIDICA],
                  script: "return dvNit({numero_documento});",
                },
              ],
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
              visibleWhen: SOLO_PERSONA_NATURAL,
            },
            {
              name: "segundo_nombre",
              type: "text",
              label: "Segundo nombre",
              colSpan: 4,
              path: "contribuyente.segundoNombre",
              visibleWhen: SOLO_PERSONA_NATURAL,
            },
            {
              name: "primer_apellido",
              type: "text",
              label: "Primer apellido",
              colSpan: 4,
              path: "contribuyente.primerApellido",
              required: true,
              visibleWhen: SOLO_PERSONA_NATURAL,
            },
            {
              name: "segundo_apellido",
              type: "text",
              label: "Segundo apellido",
              colSpan: 4,
              path: "contribuyente.segundoApellido",
              visibleWhen: SOLO_PERSONA_NATURAL,
            },
          ]),
          buildRow([
            {
              name: "nombre_completo",
              type: "text",
              label: "Razón social",
              colSpan: GRID_BASE_COLUMNS,
              path: "contribuyente.nombreCompleto",
              required: true,
              visibleWhen: SOLO_PERSONA_JURIDICA,
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
              // No viaja en el payload: solo acota el catalogo de municipios.
              excluded: true,
              required: true,
              dataSource: { catalog: CATALOG_DEPARTAMENTOS },
            },
            {
              name: "municipio",
              type: "select",
              label: "Municipio",
              colSpan: 5,
              path: "contribuyente.idCiudad",
              required: true,
              // El catalogo de municipios se consulta por departamento: sin el no hay nada que elegir.
              enableWhen: { field: "departamento", operator: "isNotEmpty" },
              dataSource: { catalog: CATALOG_MUNICIPIOS, dependsOn: "departamento" },
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
              pattern: TELEFONO_PATTERN,
              message: TELEFONO_MESSAGE,
            },
            {
              name: "correo_electronico",
              type: "text",
              label: "Correo electrónico",
              colSpan: 8,
              path: "contribuyente.correo",
              required: true,
              pattern: CORREO_PATTERN,
              message: CORREO_MESSAGE,
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
              type: "calculated",
              label:
                "10. Total Ingresos Ordinarios y Extraordinarios en Este Municipio (Renglón 8-9)",
              colSpan: GRID_BASE_COLUMNS,
              path: "baseGravable.totalIngresosOrdinarios",
              alwaysDisabled: true,
              script: "return {total_ingresos_nacionales} - {ingresos_fuera_municipio};",
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
              type: "calculated",
              label: "16. TOTAL INGRESOS GRAVABLES (Renglón 10 Menos 11, 12, 13, 14 y 15)",
              colSpan: GRID_BASE_COLUMNS,
              path: "baseGravable.totalIngresosGravables",
              alwaysDisabled: true,
              script:
                "return {total_ingresos_ordinarios} - {ingresos_devoluciones_descuentos} - {ingresos_exportaciones} - {ingresos_venta_activos} - {ingresos_excluidos_no_gravados} - {ingresos_exentos_municipio};",
            },
          ]),
        ],
      },
      buildActividadesStep(),
      {
        title: "Impuesto a cargo",
        rows: [
          buildRow([
            {
              name: "total_impuesto",
              type: "calculated",
              label: "17. Total Impuesto",
              colSpan: GRID_BASE_COLUMNS,
              excluded: true,
              alwaysDisabled: true,
              script: "return sum({impuesto_actividad});",
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
              type: "calculated",
              label: "20. Total Impuesto de Industria y Comercio (Renglón 17 + 19)",
              colSpan: GRID_BASE_COLUMNS,
              excluded: true,
              alwaysDisabled: true,
              script: "return {total_impuesto} + {impuesto_ley_56};",
            },
          ]),
          buildRow([
            {
              name: "impuesto_avisos_tableros",
              type: "calculated",
              label: "21. Impuesto de Avisos y Tableros (15% Renglón 20)",
              colSpan: GRID_BASE_COLUMNS,
              path: "impuestoACargo.impuestoAvisosTableros",
              alwaysDisabled: true,
              script: "return {total_impuesto_industria_comercio} * 0.15;",
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
              type: "calculated",
              label: "25. Total Impuesto a Cargo (Renglón 20 + 21 + 22 + 23 + 24)",
              colSpan: GRID_BASE_COLUMNS,
              path: "impuestoACargo.totalImpuestoACargo",
              alwaysDisabled: true,
              script:
                "return {total_impuesto_industria_comercio} + {impuesto_avisos_tableros} + {pago_unidades_sector_financiero} + {sobretasa_bomberil} + {sobretasa_seguridad};",
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
          // El renglon 31 son tres campos en una linea: el rotulo, que tipo de sancion y cuanto.
          // El tipo va en radio y no en desplegable porque son cuatro opciones cortas y asi se
          // ven todas de una; inlineOptions es lo que las pone al lado en vez de una bajo otra.
          buildRow([
            {
              name: "sancion_rotulo",
              type: "label",
              label: "31. Más: Sanciones:",
              colSpan: 5,
              labelFor: "tipo_sancion",
            },
            {
              name: "tipo_sancion",
              type: "radio_group",
              label: "Tipo de sanción",
              colSpan: 7,
              path: "ajusteDeclaracion.idTipoSancion",
              dataSource: { catalog: CATALOG_TIPOS_SANCION },
              inlineOptions: true,
            },
            {
              name: "valor_sancion",
              type: "number",
              label: "Valor de la sanción",
              colSpan: 4,
              path: "ajusteDeclaracion.valorSancion",
              required: true,
              min: 0,
              // Sin alwaysDisabled a proposito: el bloqueo lo decide el script solo. El runtime
              // trata computed como disabled, asi que el campo queda de lectura cuando el script
              // devuelve un valor -- extemporaneidad -- y tecleable cuando devuelve undefined, que
              // es el caso de los otros tres tipos de sancion. Un solo renglon sirve para la que el
              // sistema sabe liquidar y para las tres que no.
              //
              // Sigue siendo type: "number" y no "calculated" por lo mismo: la mitad de las veces
              // lo escribe una persona.
              script: SANCION_EXTEMPORANEIDAD_SCRIPT,
            },
          ]),
          // La descripcion va en fila propia y no al lado: asi el renglon 31 no cambia de forma al
          // elegir OTRA, y como PreviewRowsGrid omite la fila donde ningun campo se ve, la fila
          // entera desaparece sin dejar hueco.
          //
          // No lleva validacion condicional: un campo oculto no se valida, asi que required a
          // secas ya significa "obligatorio solo cuando se ve", que es justo lo que se pide.
          buildRow([
            {
              name: "sancion_descripcion_rotulo",
              type: "label",
              label: "Describa la sanción:",
              colSpan: 5,
              // Sin visibleWhen propio a proposito: la hereda de su campo. Repetir la condicion
              // aca funcionaria hoy y se desincronizaria a la primera vez que alguien edite una
              // sola de las dos.
              labelFor: "descripcion_sancion",
            },
            {
              name: "descripcion_sancion",
              type: "text",
              label: "Descripción de la sanción",
              colSpan: 11,
              path: "ajusteDeclaracion.descripcionSancion",
              required: true,
              visibleWhen: { field: "tipo_sancion", operator: "equals", value: TIPO_SANCION_OTRA },
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
              type: "calculated",
              label: "33. Total Saldo a Cargo (Renglón 25 - 26 - 27 - 28 - 29 + 30 + 31 - 32)",
              colSpan: GRID_BASE_COLUMNS,
              path: "totalDeclaracion.totalSaldoACargo",
              alwaysDisabled: true,
              script: `return max(${SALDO_NETO}, 0);`,
            },
          ]),
          buildRow([
            {
              name: "total_saldo_a_favor",
              type: "calculated",
              label:
                "34. Total Saldo a Favor (Renglón 25 - 26 - 27 - 28 - 29 + 30 + 31 - 32) si el resultado es menor a cero",
              colSpan: GRID_BASE_COLUMNS,
              path: "totalDeclaracion.totalSaldoAFavor",
              alwaysDisabled: true,
              script: `return max(-(${SALDO_NETO}), 0);`,
            },
          ]),
        ],
      },
      {
        title: "Totales",
        rows: [
          // Sale del 33 y no del neto: el 33 ya viene recortado con max(..., 0), asi que cuando la
          // liquidacion da a favor vale 0 y este renglon con el. Es la regla "si hay saldo a favor
          // no hay valor a pagar" sin escribir ninguna condicion.
          //
          // Algunos municipios piden ver el saldo a favor aca como un valor a pagar negativo. Esa
          // variante todavia no se hace: seria cambiar este script por el neto sin recortar.
          buildRow([
            {
              name: "valor_a_pagar",
              type: "calculated",
              label: "35. Valor a Pagar",
              colSpan: GRID_BASE_COLUMNS,
              excluded: true,
              alwaysDisabled: true,
              script: "return {total_saldo_a_cargo};",
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
              type: "calculated",
              label: "38. Total a Pagar (Renglón 35 - 36 + 37)",
              colSpan: GRID_BASE_COLUMNS,
              path: "totalDeclaracion.totalDeclaracion",
              alwaysDisabled: true,
              // Resta el 34 aunque el rotulo oficial no lo nombre. Con saldo a favor el 35 vale 0,
              // asi que sin esa resta los intereses de mora se cobrarian enteros sobre una deuda
              // que no existe: lo que queda por pagar es lo que los intereses superen al saldo a
              // favor. El max(..., 0) es el otro lado de lo mismo -- por debajo de cero el
              // resultado ya es el saldo a favor, y ese se declara en el 34, no aca en negativo.
              script:
                "return max({valor_a_pagar} - {descuento_pronto_pago} + {interes_mora} - {total_saldo_a_favor}, 0);",
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
              type: "calculated",
              label: "40. Total a Pagar Con Pago Voluntario (Renglón 38 + 39)",
              colSpan: GRID_BASE_COLUMNS,
              excluded: true,
              alwaysDisabled: true,
              script: "return {total_a_pagar} + {valor_aporte_voluntario};",
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
              dataSource: { catalog: CATALOG_TIPOS_DOCUMENTO },
            },
            {
              name: "numero_documento_declarante",
              type: "text",
              label: "Número de documento del declarante",
              colSpan: 8,
              path: "declarante.numeroDocumento",
              required: true,
              pattern: DOCUMENTO_PATTERN,
              message: DOCUMENTO_MESSAGE,
              validationOverrides: [nitOverride("tipo_documento_declarante")],
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
              dataSource: { catalog: CATALOG_TIPOS_DOCUMENTO },
            },
            {
              name: "numero_documento_responsable",
              type: "text",
              label: "Número de documento del responsable",
              colSpan: 8,
              path: "responsableLegal.numeroDocumento",
              pattern: DOCUMENTO_PATTERN,
              message: DOCUMENTO_MESSAGE,
              validationOverrides: [nitOverride("tipo_documento_responsable")],
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
    ]),
    {
      roundingExceptions: FIELDS_WITHOUT_ROUNDING,
      clampedCalculated: CALCULATED_WITHOUT_NEGATIVE,
      decimals: TEMPLATE_DECIMALS,
      decimalsByField: DECIMALS_BY_FIELD,
    },
  );
}
