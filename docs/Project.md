# Especificación del Proyecto: Orquestador y Constructor de Formularios Dinámicos (Form Orquestator)

## 1. Descripción General
Desarrollar una aplicación web interactiva que actúe como un orquestador para la creación de formularios paso a paso (step-by-step). El sistema debe permitir la construcción visual mediante `Drag and Drop` (DnD), inyección de lógica personalizada (TS), manejo de campos dependientes, sistema de grillas personalizable y almacenamiento temporal. El resultado final del flujo debe ser la compilación de toda la configuración en un único archivo JSON estructural.

## 2. Flujo de Inicialización (Setup Wizard)
Al crear un nuevo proyecto, el sistema debe desplegar un modal de configuración inicial con las siguientes decisiones:
* **Tipo de Formulario:**
  * Si selecciona **"Industria y Comercio"**: Cargar automáticamente un JSON base (plantilla sugerida) preexistente en el proyecto.
  * Si selecciona **"Retención de Industria y Comercio"** o **"Autorretención"**: Iniciar con un lienzo en blanco (desde cero).
* **Configuración de Modal de Entrada:** Preguntar si el formulario compilado requerirá un modal introductorio para el usuario final. En caso afirmativo, solicitar:
  * Cantidad de pasos (steps) del modal.
  * Ya el usuario usa el drag and drop para agregar los campos y sus validaciones

## 3. Arquitectura de la Interfaz (UI/UX)
La aplicación debe dividirse en un layout de dos columnas principales:

### Columna Izquierda: Panel de Herramientas y Propiedades (Sidebar)
Debe actuar como un sistema de pestañas o acordeón dinámico. Al seleccionar un campo en el lienzo, este panel cambia a "Modo Edición" con las siguientes secciones:
1. **Atributos Dinámicos:** Nombre del campo, tipo (input, select, etc.), placeholders y binding de datos.
2. **Validaciones:** Interfaz para agregar reglas (requerido, longitud, regex, esquemas tipados).
3. **Estilos:** Configuración visual (clases CSS, márgenes, colores).
4. **Lógica y TypeScript:** Editor de código embebido (tipo Monaco Editor) para inyectar scripts personalizados, tipado TS y lógica de dependencia (ej. "Mostrar solo si el campo X tiene el valor Y").
5. **Almacén de Partes:** Repositorio de componentes guardados previamente para ser reutilizados.

### Columna Derecha: Lienzo de Trabajo (Canvas & Grid System)
Área interactiva donde se sueltan los componentes.
* **Sistema de Grilla:** Basado en un sistema de 12 columnas. 
* **Control de Layout:** Al hacer clic en el lienzo (o en un contenedor específico), debe aparecer un "Floating Action Menu" (modal pequeño superior) que pregunte cuántas columnas base tendrá la fila actual (por defecto 12).
* **Expansión de Campos (Col-Span):** Al insertar un campo en el lienzo, el usuario debe poder arrastrar sus bordes o configurar en su menú cuántas columnas de la grilla ocupará.

## 4. Gestión de Estado y Persistencia (Autosave)
* **Autoguardado:** Implementar un *worker* o *cron* interno en el cliente que serialice el estado actual de la tienda (store) cada 5 minutos y lo guarde (en `localStorage`, `IndexedDB` o backend).
* **Recuperación:** Al montar la aplicación (abrir el proyecto), verificar si existe un "draft" previo. Si existe, notificar al usuario y permitir restaurar la sesión de trabajo.

## 5. Salida del Sistema (Output)
Al finalizar, un botón de "Exportar/Generar" debe compilar el estado del lienzo, las validaciones, los scripts y la configuración inicial en un único archivo JSON bien estructurado y descargable.

## 6. Sugerencias Técnicas para la Implementación (Para la IA generadora)
* **Drag and Drop:** Utilizar `dnd-kit` (React) o similar por su soporte modular y accesibilidad.
* **Validaciones:** Integrar `Zod` para la generación de esquemas de validación desde la interfaz, garantizando inferencia de tipos estricta para los campos generados, usar react hook form para hacer los registros de los campos y zod ya se usaria para las validaciones.
* **Gestor de Estado:** `Zustand` o `Redux Toolkit` para manejar el complejo árbol JSON en tiempo real.
* **Usar Tailwind para agregar clases**

{
  "projectMeta": {
    "formId": "frm_ica_001",
    "formType": "Industria y Comercio",
    "version": "1.0.0",
    "createdAt": "2026-07-07T14:30:00Z"
  },
  "setupConfig": {
    "hasIntroModal": true,
    "introModal": {
      "steps": [
        {
          "stepId": 1,
          "title": "Datos del Contribuyente",
          "fields": [
            {
              "id": "nit_input",
              "type": "text",
              "label": "NIT",
              "validations": {
                "required": true,
                "pattern": "^[0-9]+-[0-9]$",
                "message": "Formato de NIT inválido"
              }
            }
          ]
        }
      ]
    }
  },
  "formSchema": {
    "gridBaseColumns": 12,
    "steps": [
      {
        "stepId": "step_declaracion",
        "title": "Liquidación Privada",
        "rows": [
          {
            "rowId": "r1",
            "columns": 12,
            "fields": [
              {
                "fieldId": "ingresos_ordinarios",
                "type": "number",
                "label": "Ingresos Ordinarios",
                "colSpan": 6,
                "defaultValue": 0,
                "styles": {
                  "customClasses": "font-bold text-right",
                  "marginTop": "10px"
                },
                "validations": {
                  "zodSchema": "z.number().min(0, { message: 'No puede ser negativo' })"
                },
                "logic": {
                  "dependencies": [],
                  "typeScript": "const calculateBase = (val: number) => { return val > 0 ? val : 0; };"
                }
              },
              {
                "fieldId": "ingresos_fuera_municipio",
                "type": "number",
                "label": "Ingresos Fuera del Municipio",
                "colSpan": 6,
                "defaultValue": 0,
                "styles": {},
                "validations": {
                  "zodSchema": "z.number().min(0)"
                },
                "logic": {
                  "dependencies": ["ingresos_ordinarios"],
                  "typeScript": "onChange(val => { if(val > getFieldValue('ingresos_ordinarios')) { alert('No puede ser mayor a los ordinarios'); } })"
                }
              }
            ]
          },
          {
            "rowId": "r2",
            "columns": 12,
            "fields": [
              {
                "fieldId": "total_ingresos",
                "type": "calculated",
                "label": "Total Ingresos Netos",
                "colSpan": 12,
                "styles": {
                  "backgroundColor": "#f3f4f6"
                },
                "logic": {
                  "dependencies": ["ingresos_ordinarios", "ingresos_fuera_municipio"],
                  "typeScript": "return getFieldValue('ingresos_ordinarios') - getFieldValue('ingresos_fuera_municipio');"
                }
              }
            ]
          }
        ]
      }
    ]
  }
}