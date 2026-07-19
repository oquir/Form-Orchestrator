import { GRID_BASE_COLUMNS } from "../../constants/grid";
import type { CanvasRow } from "../../types/storeTypes";

export function getIndustriaComercioTemplate(): CanvasRow[] {
  return [
    {
      id: "r1",
      columns: GRID_BASE_COLUMNS,
      fields: [
        {
          id: "ingresos_ordinarios",
          type: "number",
          label: "Ingresos Ordinarios",
          colSpan: 8,
          validations: { required: true, min: 0, message: "No puede ser negativo" },
          styles: {},
          logic: { dependencies: [], typeScript: "" },
        },
        {
          id: "ingresos_fuera_municipio",
          type: "number",
          label: "Ingresos Fuera del Municipio",
          colSpan: 8,
          validations: { required: true, min: 0 },
          styles: {},
          logic: {
            dependencies: ["ingresos_ordinarios"],
            typeScript:
              "onChange(val => { if (val > getFieldValue('ingresos_ordinarios')) { alert('No puede ser mayor a los ordinarios'); } });",
          },
        },
      ],
    },
    {
      id: "r2",
      columns: GRID_BASE_COLUMNS,
      fields: [
        {
          id: "total_ingresos",
          type: "calculated",
          label: "Total Ingresos Netos",
          colSpan: GRID_BASE_COLUMNS,
          validations: {},
          styles: {},
          logic: {
            dependencies: ["ingresos_ordinarios", "ingresos_fuera_municipio"],
            typeScript:
              "return getFieldValue('ingresos_ordinarios') - getFieldValue('ingresos_fuera_municipio');",
          },
        },
      ],
    },
  ];
}
