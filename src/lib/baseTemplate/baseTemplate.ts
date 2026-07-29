import { v4 as uuidv4 } from "uuid";
import { GRID_BASE_COLUMNS } from "../../constants/grid";
import type { CanvasRow, IntroModalStep } from "../../types/formStructure";

export type IntroStepTemplate = Omit<IntroModalStep, "stepId">;

export const INDUSTRIA_COMERCIO_FORM_STEPS: number = 7;
export const INDUSTRIA_COMERCIO_INTRO_STEPS: number = 2;

export function getIndustriaComercioIntroTemplate(): IntroStepTemplate[] {
  return [
    {
      title: "Seleccione año gravable y período",
      subtitle: "Complete los datos iniciales para continuar con la declaración.",
      rows: [
        {
          id: uuidv4(),
          columns: GRID_BASE_COLUMNS,
          fields: [
            {
              id: uuidv4(),
              type: "select",
              label: "Año gravable",
              colStart: 1,
              colSpan: 16,
              validations: { required: true },
              styles: {},
              logic: { dependencies: [], typeScript: "" },
              apiBinding: { kind: "mapped", path: "periodoAnio" },
            },
          ],
        },
        {
          id: uuidv4(),
          columns: GRID_BASE_COLUMNS,
          fields: [
            {
              id: uuidv4(),
              type: "toggle_group",
              label: "Periodos",
              colStart: 1,
              colSpan: GRID_BASE_COLUMNS,
              validations: { required: true },
              styles: {},
              logic: { dependencies: [], typeScript: "" },
              apiBinding: { kind: "mapped", path: "idPeriodoAnual" },
            },
          ],
        },
      ],
    },
    {
      title: "Seleccione tipo de declaración",
      subtitle: "Elija el tipo de declaración que corresponde al flujo actual.",
      rows: [
        {
          id: uuidv4(),
          columns: GRID_BASE_COLUMNS,
          fields: [
            {
              id: uuidv4(),
              type: "select",
              label: "Tipo de declaración",
              colStart: 1,
              colSpan: GRID_BASE_COLUMNS,
              validations: { required: true },
              styles: {},
              logic: { dependencies: [], typeScript: "" },
              apiBinding: { kind: "mapped", path: "idTipoDeclaracion" },
            },
          ],
        },
      ],
    },
  ];
}

export function getIndustriaComercioTemplate(): CanvasRow[] {
  const ingresosOrdinariosId: string = uuidv4();
  const ingresosFueraMunicipioId: string = uuidv4();

  return [
    {
      id: uuidv4(),
      columns: GRID_BASE_COLUMNS,
      fields: [
        {
          id: ingresosOrdinariosId,
          type: "number",
          label: "Ingresos Ordinarios",
          colStart: 1,
          colSpan: 8,
          validations: { required: true, min: 0, message: "No puede ser negativo" },
          styles: {},
          logic: { dependencies: [], typeScript: "" },
        },
        {
          id: ingresosFueraMunicipioId,
          type: "number",
          label: "Ingresos Fuera del Municipio",
          colStart: 9,
          colSpan: 8,
          validations: { required: true, min: 0 },
          styles: {},
          logic: {
            dependencies: [ingresosOrdinariosId],
            typeScript: `onChange(val => { if (val > getFieldValue('${ingresosOrdinariosId}')) { alert('No puede ser mayor a los ordinarios'); } });`,
          },
        },
      ],
    },
    {
      id: uuidv4(),
      columns: GRID_BASE_COLUMNS,
      fields: [
        {
          id: uuidv4(),
          type: "calculated",
          label: "Total Ingresos Netos",
          colStart: 1,
          colSpan: GRID_BASE_COLUMNS,
          validations: {},
          styles: {},
          logic: {
            dependencies: [ingresosOrdinariosId, ingresosFueraMunicipioId],
            typeScript: `return getFieldValue('${ingresosOrdinariosId}') - getFieldValue('${ingresosFueraMunicipioId}');`,
          },
        },
      ],
    },
  ];
}
