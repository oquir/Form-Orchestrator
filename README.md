# Form Orchestrator

Constructor visual de formularios paso a paso ("step-by-step form builder") con drag-and-drop, que compila toda su configuración a un único documento JSON estructurado.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Zustand** para el estado global (canvas, steps, campos)
- **@dnd-kit** para drag-and-drop (paleta → fila, Almacén de Partes → fila)
- **react-hook-form** + **zod** para la validación de los campos generados (los schemas Zod se generan dinámicamente por campo y se guardan como string, ej. `"z.number().min(0)"`)
- **Tailwind v4** (vía `@tailwindcss/vite`) para todo el estilado — sin CSS-in-JS
- **uuid** para generar ids de campos/filas/steps
- **Biome** como linter/formatter (2 espacios, comillas dobles, semicolons, 100 cols, organiza imports)

Package manager: **bun**. No usar npm/yarn/pnpm.

## Comandos

```bash
bun install       # instalar dependencias
bun run dev       # servidor de desarrollo (Vite)
bun run build     # typecheck (tsc -b) + build de producción
bun run lint      # Biome check (lint + format check)
bun run lint:fix  # Biome check con auto-fix
bun run format    # Biome format --write
bun run preview   # preview del build de producción
```

No hay test runner configurado todavía.

## Arquitectura

### Estado

Un único store de Zustand, `src/store/formStore.ts` (`useFormStore`). Contiene:

- `formSteps`: los steps del formulario principal, cada uno con `stepId`, `title` (obligatorio), `subtitle` (opcional) y `rows` (grid de 12 columnas).
- `introModal.steps`: steps de un modal introductorio opcional, con la misma forma (`title` obligatorio, `subtitle` opcional).
- `activeCanvas`: qué canvas se está editando (`{ type: "formStep", stepId }` o `{ type: "introStep", stepId }`).
- `selectedFieldId`, `savedComponents` (Almacén de Partes), `setupConfig`, `isSidebarOpen`, `sidebarTab`, `isDarkMode`.

Las mutaciones de campos/filas (`addFieldToRow`, `updateField`, `updateFieldValidations/Styles/Logic`, `toggleFieldDependency`, `addRowToActiveCanvas`, `removeRow`, `addFormStep`/`addIntroModalStep`, etc.) se aplican de forma uniforme sobre cualquier canvas que contenga el id objetivo vía `mapRowEverywhere`/`mapFieldEverywhere`, así el mismo código edita tanto el formulario principal como los steps del intro modal.

### Componentes — Atomic Design (3 capas)

`src/components/` sigue una organización de Atomic Design con **atoms → molecules → organisms** (sin capas `templates`/`pages`; `App.tsx` es el punto de entrada que compone todo).

- **`atoms/`** — primitivas de UI sin lógica de negocio: `Button` (variantes primary/secondary/ghost), `Input`, `Textarea`, `Label`, `Checkbox`, `FieldTypeBadge`, `IconButton`, `CodeBlock`.
- **`molecules/`** — combinaciones reutilizables de átomos: `LabeledInput`, `LabeledTextarea`, `LabeledRangeSlider`, `TwoColumnFieldGroup`, `ColorPickerField`, `SaveFieldForm` (form "guardar como componente", compartido entre Canvas y el Almacén), `SavedComponentListItem`, `DependencyCheckboxRow`, `GeneratedSchemaPreview`, `SelectableOptionCard`, `BinaryChoiceToggle`, `WizardFooterActions`, `ModalActions`, `ModalShell`, `PanelHeader`, `SidebarTabRail`, `StepTabChip`, `DashedAddButton`, `TabButtonGroup`, `SaveButton`, `CanvasFieldChip`, `PaletteChip`.
- **`organisms/`** — secciones autocontenidas: `Canvas`, `CanvasRow`, `CanvasTabs`, `FieldContextMenu`, `FieldPalette`, `Sidebar`, `DraftRecoveryModal`, `SetupWizardModal`, y `organisms/panels/` (`AttributesPanel`, `ValidationsPanel`, `StylesPanel`, `LogicPanel`, `LibraryPanel`) — estos últimos son neutrales respecto a "sidebar" y los reutilizan tanto `Sidebar` como el `FieldContextMenu` del Canvas.
- **`layout/AppLayout.tsx`** — shell de dos columnas (sidebar colapsable + canvas), fuera de la jerarquía atómica porque es el layout raíz, no un componente de UI reutilizable.

### Layout de dos columnas

- **Sidebar izquierdo** (`organisms/Sidebar.tsx`): un rail vertical de íconos (`SidebarTabRail`) para elegir tab (Campos/Atributos/Validaciones/Estilos/Lógica/Almacén) más el panel correspondiente. No hay botón dedicado para mostrar/ocultar el panel: al hacer clic en un ícono se abre esa sección, y al hacer clic de nuevo sobre la sección ya activa y abierta, el panel se cierra (toggle). El rail (ancho fijo) siempre queda visible aunque el panel esté colapsado.
- **Canvas derecho** (`organisms/Canvas.tsx`): grid de 12 columnas por fila (`@dnd-kit` `useDroppable`), tabs para cambiar entre steps del formulario y del intro modal (`CanvasTabs`), editor de título/subtítulo del step activo, controles para agregar/quitar filas y steps, y un menú contextual (`FieldContextMenu`) para editar un campo sin perder el foco del canvas.

El wiring de drag-and-drop (paleta → fila, Almacén → fila) vive en el `DndContext`/`handleDragEnd` de `App.tsx`.

### Persistencia

`src/hooks/useAutosave.ts` + `src/lib/persistence.ts`: autoguarda el store en `localStorage` cada 5 minutos una vez completado el setup. `DraftRecoveryModal` ofrece restaurar o descartar un borrador guardado al iniciar.

### Setup inicial

`organisms/SetupWizardModal.tsx`: modal de 2 pasos mostrado cuando `setupConfig.isComplete` es `false`. Paso 1 elige el `FormType` (`industria_comercio` carga una plantilla base desde `src/lib/baseTemplate.ts`; los otros tipos arrancan con una fila vacía). Paso 2 pregunta si hace falta un modal introductorio y, de ser así, cuántos steps tiene.

### Exportación

`src/lib/exportForm.ts` (`downloadFormExport`/`buildFormExport`) serializa `projectMeta`, `setupConfig.introModal` y `formSchema.steps[].rows[].fields[]` (con `colSpan`, `styles`, `validations.zodSchema` generado por `src/lib/zodSchema.ts`, y `logic`) en un único JSON descargable. Cada step (formulario e intro modal) exporta `title` y, si existe, `subtitle`.

## Gaps conocidos / no implementado

- No hay editor de código estilo Monaco para la tab de Lógica — `LogicPanel` edita `logic.typeScript` como string plano. La activación condicional sí está implementada aparte (`enableWhen` + `ConditionEditor`); `logic.dependencies` sigue siendo una lista de toggles de field-id.
- No hay test runner configurado, y no se va a agregar por ahora: el proyecto es demasiado volátil como para justificarlo.
- No hay versionado de schema en el draft de `localStorage`; si cambia la forma del store, los borradores viejos pueden romperse en silencio.

### Gaps frente al contrato de la API de Declaración de ICA

El payload real (`DeclaracionIcaE`) es un objeto **anidado** por bloques (`contribuyente`, `baseGravable`, `actividades[]`, `impuestoACargo`, `ajusteDeclaracion`, `totalDeclaracion`, `declarante`, `responsableLegal`). El builder todavía no puede expresar tres cosas que ese contrato necesita:

- **Grupos repetibles.** `actividades` es un array de `{idActividad, ingresoGravado, tarifaXMil, valorImpuestoActividad}` que el usuario final agrega N veces. El modelo `rows → fields` no tiene noción de repetición, así que hoy no hay forma de representarlo.
- **Ruta destino por campo.** El export es plano (`fields[].fieldId` es un uuid) y no dice a qué propiedad de la API corresponde cada campo — falta algo tipo `apiPath` (`"baseGravable.totalIngresosGravables"`), o bien resolver el mapeo entero del lado del consumer.
- **Opciones para `select`.** Buena parte del contrato son catálogos (`idTipoDocumento`, `idCiudad`, `idActividad`, `idTipoSancion`, `idTipoRepresentante`, …) que se llenan desde endpoints. Sólo `toggle_group` y `radio_group` tienen `options[]`; el tipo `select` no tiene ni opciones estáticas ni forma de apuntar a una fuente remota.

`docs/Project.md` (en español) es la especificación de producto original — sigue siendo la referencia para la forma del JSON destino y cualquier detalle no implementado; conviene revisarla antes de agregar features para que la estructura coincida con el modelo de datos previsto.
