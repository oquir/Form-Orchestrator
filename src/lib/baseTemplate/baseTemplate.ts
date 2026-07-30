import { v4 as uuidv4 } from "uuid";
import { GRID_BASE_COLUMNS } from "../../constants/grid";
import type { CanvasField } from "../../types/field";
import type { CanvasRow, FormStep, IntroModalStep } from "../../types/formStructure";

export type IntroStepTemplate = Omit<IntroModalStep, "stepId">;
export type FormStepTemplate = Omit<FormStep, "stepId">;

export const INDUSTRIA_COMERCIO_FORM_STEPS: number = 7;
export const INDUSTRIA_COMERCIO_INTRO_STEPS: number = 2;

interface FieldSpec {
  name: string;
  type: string;
  label: string;
  colSpan: number;
  path?: string;
  required?: boolean;
  min?: number;
  formula?: string;
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
      apiBinding: spec.path === undefined ? undefined : { kind: "mapped", path: spec.path },
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
  ];
}
