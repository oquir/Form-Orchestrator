# Form Orchestrator

Constructor visual de formularios paso a paso ("step-by-step form builder") con drag-and-drop, que compila toda su configuración a un único documento JSON estructurado.

El caso de uso que guía el diseño es el **autoliquidable de Industria y Comercio (ICA)**: ocho pasos, cálculos encadenados entre renglones y un bloque repetible de actividades económicas. La plantilla de ICA viene armada por defecto.

## Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Zustand 5** para el estado global (canvas, steps, campos, grupos)
- **@dnd-kit** para drag-and-drop (paleta → fila, Almacén de Partes → fila, campo → fila)
- **react-hook-form** + **zod 4** para la validación de los campos generados (los schemas Zod se generan dinámicamente por campo y se guardan como string, ej. `"z.number().min(0)"`)
- **Tailwind v4** (vía `@tailwindcss/vite`) para todo el estilado — sin CSS-in-JS. Modo oscuro por clase, con tokens de tema en `src/index.css`
- **uuid** para generar ids de campos/filas/steps
- **reicon-react** para íconos
- **@uiw/react-json-view** para las vistas de JSON (`JsonPreviewCanvas` y `PayloadPreviewCanvas`)
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

No hay test runner configurado, y no se va a agregar por ahora. La verificación se hace con scripts `bun run` desechables.

## Arquitectura

### Estado

Un único store de Zustand, `src/store/formStore.ts` (`useFormStore`), con los constructores y recorridos en `formStore.utils.ts`. Contiene:

- `formSteps`: los steps del formulario principal, cada uno con `stepId`, `title`, `subtitle` opcional, sus `rows` y sus `groups` opcionales.
- `introModal.steps`: steps de un modal introductorio opcional, con la misma forma pero **sin** grupos.
- `activeCanvas`: qué canvas se está editando (`{ type: "formStep", stepId }` o `{ type: "introStep", stepId }`).
- `selectedFieldId`, `savedComponents` (Almacén de Partes), `setupConfig`, `isSidebarOpen`, `sidebarTab`, `dragPlacement`, `isDarkMode`, `lastSavedAt`.

Las mutaciones de campos y filas se aplican de forma uniforme sobre cualquier canvas que contenga el id objetivo, vía `mapRowEverywhere`/`mapFieldEverywhere`, así el mismo código edita tanto el formulario principal como los steps del modal.

> **Los selectores deben devolver referencias estables.** Zustand los lee a través de `useSyncExternalStore`, que compara por identidad: un selector que devuelve un `[]` nuevo en cada llamada provoca "Maximum update depth exceeded". Para eso están las constantes `NO_ROWS`/`NO_GROUPS` en `formStore.constants.ts` — nunca poner un literal de arreglo vacío dentro de un selector.

### Grilla y posicionamiento

`GRID_BASE_COLUMNS = 16` es el ancho por defecto de una fila, pero cada fila lleva su propio `columns` (entre 1 y 24). Cada campo guarda `colStart` y `colSpan`, y **ambos viajan en el JSON exportado**, así que el consumidor tiene que leerlos o el layout no sobrevive el viaje.

Las reglas viven en `src/lib/rowLayout/` como funciones puras. Tres decisiones asentadas:

- **Las colisiones se resuelven por imán, nunca empujando.** Si el rango destino pisa a un vecino, la vista previa se corre al hueco válido más cercano; si no entra en ninguno, se pone roja y el drop se rechaza. Un campo que no estás arrastrando nunca se mueve.
- **Los huecos se preservan.** Borrar o mover un campo deja su hueco; toda posición es explícita.
- **Una fila es una línea visual.** Una fila llena rechaza el campo en vez de desbordar a una segunda línea. Es una restricción deliberada, no un bug.

Manteniendo **Shift** mientras arrastrás elegís la columna de inicio; con **Shift+Ctrl** además definís el ancho con el puntero.

### Componentes — Atomic Design

`src/components/` sigue **atoms → molecules → organisms**, más `layout/`. Cada componente y hook vive en su **propia carpeta** con archivos co-locados: `X/X.tsx`, `X/X.types.ts`, `X/X.constants.ts`, `X/X.utils.ts` (solo los que necesite). Las libs siguen el mismo patrón en `src/lib/<nombre>/`.

> Un `X.types.ts` o `X.constants.ts` es **privado a su carpeta**. En cuanto algo de afuera lo importa, la declaración pasa a `src/types/` o `src/constants/`. Ambas direcciones están auditadas en cero.

- **`atoms/`** — primitivas sin lógica de negocio: `Button`, `Input`, `TextArea`, `Label`, `Checkbox`, `CodeBlock`, `IconButton`, `FieldTypeBadge`, `FieldDragHandle`, `FieldResizeHandle`, `DashedAddButton`, `ModalShell`, `ModalActions`, `TwoColumnFieldGroup`, `WizardFooterActions`, `RichTextView`.
- **`molecules/`** — combinaciones reutilizables: `LabeledInput`, `LabeledTextarea`, `LabeledRangeSlider`, `ColorPickerField`, `FieldNameInput`, `CanvasFieldChip`, `FieldPreviewControl`, `PaletteChip`, `DragPreview`, `RowZoneOverlay`, `ApiPathSelect`, `FormulaInput`, `RichTextEditor`, `LabelTargetSelect`, `RuleEffectRow`, `ConditionFieldSelect`, `ConditionOperatorSelect`, `ConditionValueInput`, `ConditionActivationToggle`, `DependencyCheckboxRow`, `GeneratedSchemaPreview`, `SaveFieldForm`, `SavedComponentListItem`, `SelectableOptionCard`, `BinaryChoiceToggle`, `PanelHeader`, `SidebarTabRail`, `StepTabChip`, `TabButtonGroup`.
- **`organisms/`** — secciones autocontenidas: `Canvas`, `CanvasRow`, `CanvasRowsGrid`, `CanvasTabs`, `CanvasAddRowButton`, `CanvasAddGroupButton`, `RepeatableGroupBand`, `RowColumnsMenu`, `StepTitleEditor`, `FieldPalette`, `FieldContextMenu`, `FieldOptionsModal`, `Sidebar`, `SaveButton`, `JsonPreviewCanvas`, `PayloadPreviewCanvas`, `DraftRecoveryModal`, `SetupWizardModal`, `FormBuilder`, y `organisms/panels/` (`AttributesPanel`, `ValidationsPanel`, `StylesPanel`, `LogicPanel`, `ApiMappingPanel`, `LibraryPanel`, `ConditionEditor`, `FieldRulesEditor`, `FieldOptionsEditor`, `FileOptionsEditor`).
- **`layout/AppLayout.tsx`** — shell de dos columnas, fuera de la jerarquía atómica porque es el layout raíz.

### Layout de dos columnas

- **Sidebar izquierdo** (`organisms/Sidebar/`): un rail vertical de íconos (`SidebarTabRail`, incluye el toggle de modo oscuro) más el panel correspondiente. Las pestañas son Campos, Atributos, Validaciones, Estilos, Lógica, Mapeo API y Almacén. Al hacer clic sobre la pestaña ya activa, el panel se colapsa; el rail siempre queda visible.
- **Canvas derecho** (`organisms/Canvas/`): una grilla por fila (`@dnd-kit` `useDroppable`), tabs para cambiar entre steps del formulario y del modal, editor de título/subtítulo, control de columnas por fila, redimensionado de campos por arrastre y menú contextual por campo. El encabezado trae el botón de guardar, "Ver JSON" (`JsonPreviewCanvas`, vista previa en vivo del export), la vista de cobertura del contrato (`PayloadPreviewCanvas`) y "Exportar JSON".

El wiring de drag-and-drop vive en `src/hooks/useDragAndDrop/`; el `DndContext`/`DragOverlay` los arma `organisms/FormBuilder/`, que es lo único que envuelve al `AppLayout`.

`App.tsx` no dibuja nada del constructor: es la compuerta de arranque. Monta los hooks globales (`useThemeClass`, `useAutosave`, `useKeyboardShortcuts`) y decide qué mostrar en este orden — `DraftRecoveryModal` si hay borrador, `SetupWizardModal` si el setup no está completo, `FormBuilder` si ya lo está.

### Hooks

Cada hook vive en su propia carpeta, igual que los componentes:

- **Arranque y estado global** — `useThemeClass` (aplica la clase `dark` en el `<html>`), `useAutosave`, `useKeyboardShortcuts` (Ctrl/Cmd+S), `useDraftRecovery`.
- **Interacción del canvas** — `useDragAndDrop`, `useFieldResize`, `useFieldContextMenu`.
- **Paneles** — `useConditionEditor` (compartido por los dos editores de condición), `useFieldRules`, `useSetupWizard`, `useSaveButton`.
- **Genéricos** — `useClickOutside`.

### Tipos de campo

Se declaran en `FIELD_TYPES` (`src/constants/fieldTypes.ts`) y se agrupan por categoría, que es lo que dibuja la paleta:

- **Básicos** — `text`, `number`, `select`, `textarea`, `checkbox`, `calculated`, `file`.
- **Complejos** — `search_select`, `toggle_group`, `radio_group`, `checkbox_group`.
- **Contenido** — `label`, `rich_text`.

`checkbox` y `checkbox_group` son tipos distintos a propósito: el primero es un booleano único, el segundo es multi-selección con `options[]`.

### Campos presentacionales

Los tipos de la categoría Contenido **no reciben ningún valor**: solo muestran texto. Conservan estilos, tamaño, posición y visibilidad condicional; no tienen validaciones, no se mapean al payload, no generan schema Zod y no aparecen como candidatos de condición ni de fórmula. El predicado es `isPresentationalField` (`src/lib/fieldKind/`).

- **`label`** — una etiqueta suelta que puede **ligarse a un campo** vía `labelFor`. El campo ligado deja de mostrar su propia etiqueta. La relación es 1:1 y se limpia sola si borrás el campo destino.
- **`rich_text`** — un bloque de texto con negrita, cursiva, subrayado y enlaces. **El contenido se guarda estructurado, no como HTML**, así el consumidor lo pinta con componentes y nunca necesita `dangerouslySetInnerHTML`. El serializador funciona como sanitizador: recorre el DOM con lista blanca, y los enlaces solo admiten `http`, `https` y `mailto`.

### Tooltips de ayuda

Ocho tipos de campo pueden llevar un **tooltip**: `text`, `number`, `select`, `checkbox`, `calculated`, `file`, `toggle_group` y `radio_group` (`TOOLTIP_CAPABLE_FIELD_TYPES`). El predicado es `supportsTooltip` (`src/lib/fieldTooltip/`). El resto no lo ofrece a propósito.

El tooltip lleva `content`, `position` (`top` | `bottom` | `left` | `right`) y un `customClasses` opcional. El `content` es **el mismo `RichTextContent` estructurado que usa `rich_text`**, así que admite negrita, cursiva, subrayado y enlaces, pasa por el mismo sanitizador y el consumidor lo pinta con los mismos componentes — nunca con `dangerouslySetInnerHTML`.

Lo que debe hacer el consumidor: si el campo trae `tooltip`, dibujar un **ícono de información junto a la etiqueta visible** y mostrar el contenido en `position` al hacer hover o tap sobre ese ícono. El disparador es el ícono, no el campo entero: se descubre a simple vista, funciona en celular y no tapa lo que el contribuyente va a tocar. Si el campo tiene su etiqueta ligada por `labelFor`, el ícono va junto a **esa** etiqueta.

En el lienzo del builder el ícono aparece igual, pero la burbuja se previsualiza al pasar el mouse por el campo completo, para poder juzgar la posición elegida sin tener que apuntarle al ícono.

Un tooltip cuyo contenido queda vacío **no se exporta**: `exportableTooltip` lo descarta, igual que `exportableOptions` con las opciones.

### Grupos repetibles

Un grupo repetible es una **marca sobre la fila** (`CanvasRow.groupId`), no un contenedor anidado. Gracias a eso el drag-and-drop, el redimensionado y todas las reglas de posicionamiento siguen funcionando dentro del grupo sin ningún cambio: los campos de una actividad se mueven y reordenan libremente.

Cada grupo lleva `min`, `max` y un `arrayPath` que lo ata a un arreglo del contrato (por defecto 1 a 15 sobre `actividades`, la regla de ICA, pero es parametrizable). Sacar un campo del grupo limpia su mapeo, porque una ruta dentro del item no significa nada afuera.

### Fórmulas y reglas

`src/lib/formula/` implementa un pequeño lenguaje aritmético propio — tokenizador más descenso recursivo, **sin `eval`**. Funciones: `abs`, `min`, `max`, `sum`, `round`, `floor`, `ceil`. Agregaciones sobre un grupo repetible: `sumOf(campo)` y `countOf(campo)`.

Además de la fórmula, un campo puede llevar **reglas** (`FieldRule`): un conjunto de condiciones y los efectos que se aplican si se cumplen (una fórmula o un valor constante).

`src/lib/fieldGraph/` unifica **seis** fuentes de dependencias en un solo grafo —`visibleWhen`, `enableWhen`, las condiciones de las reglas, las referencias dentro de las fórmulas de las reglas, las de `logic.formula` y `logic.dependencies`— y detecta ciclos, que es lo que impide armar un cálculo circular desde la interfaz.

### Condiciones

Cada campo lleva dos condiciones independientes: `visibleWhen` decide si **se dibuja**, `enableWhen` si es **editable**. El orden de precedencia que debe aplicar el consumidor es: si `visibleWhen` da falso el campo no se renderiza ni se valida; si no, `alwaysDisabled` lo deja de solo lectura; si no, `enableWhen` decide si va deshabilitado.

### Mapeo al payload

`PAYLOAD_SCHEMA` (`src/constants/payloadSchema.ts`) es el contrato real de `DeclaracionIcaE`. Cada campo se marca como **mapeado** a una hoja del contrato, **excluido** del payload, o queda sin definir. `PayloadPreviewCanvas` muestra la cobertura: qué hojas están cubiertas, cuáles no, y qué campos apuntan a rutas que ya no existen.

Los campos con opciones solo admiten opciones escritas a mano **cuando están excluidos del payload y no declaran un catálogo**. En cualquier otro caso las inyecta en tiempo de ejecución el aplicativo receptor.

### De dónde salen las opciones (`dataSource`)

`dataSource` es `{catalog, dependsOn?}` y responde **de dónde salen las opciones**, mientras que `apiBinding` responde **si el valor viaja en el payload**. Son preguntas independientes: `departamento` está excluido (la API solo quiere `idCiudad`, porque el municipio ya implica el departamento) y aun así necesita consultar el catálogo `departamentos`.

Precedencia que aplica el consumidor, en este orden:

1. Si el campo trae `options[]`, se usan. Solo se exportan para campos excluidos sin catálogo.
2. Si trae `dataSource`, se consulta `dataSource.catalog`. Si además trae `dependsOn`, se pasa el valor actual de ese campo como parámetro y no se ofrece nada hasta que lo tenga.
3. Si no trae ninguno y está mapeado, se infiere el catálogo desde `apiBinding.path`.

`options[]` y `dataSource` **nunca viajan juntos**: `allowsManualOptions` devuelve `false` en cuanto hay catálogo, así que el export descarta las opciones y el schema Zod cae a `z.string()` en vez de congelar valores viejos. El catálogo se elige de una lista cerrada (`CATALOGS` en `src/constants/catalog.ts`), no se escribe a mano, por la misma razón que la ruta se elige de `PAYLOAD_SCHEMA`.

El par real hoy es `departamento` → `municipio`: el segundo declara `{catalog:"municipios", dependsOn:"departamento"}` y un `enableWhen` con `isNotEmpty`, así que arranca deshabilitado y su catálogo se consulta filtrado.

### Banco de catálogos

La pestaña **Catálogos** del sidebar guarda las opciones que el simulador ofrece en cada campo de catálogo. Se cargan **pegando la respuesta del endpoint** e indicando qué campo es el id, cuál la etiqueta y, en catálogos parametrizados, cuál apunta al padre.

Vive en su propia clave de `localStorage` (`form-orchestrator-catalogs`): **no entra al borrador ni al JSON exportado**, y se comparte entre formularios — los departamentos que cargues una vez los usa también el formulario de retención, porque la unidad es el catálogo y no el campo.

Cada catálogo tiene su propio interruptor **Por defecto / Personalizado**. Volver a "Por defecto" **no borra lo cargado**, solo lo ignora: podés probar con los datos de prueba del simulador y regresar a los reales sin volver a pegar el JSON. Un catálogo que nunca cargaste usa siempre los datos de prueba.

En el simulador, la etiqueta **"Catálogo simulado"** debajo de un campo indica que sus opciones son inventadas. Si el catálogo está en modo personalizado, la etiqueta desaparece — así se ve, campo por campo, con qué datos estás probando.

### Persistencia

`src/hooks/useAutosave/` + `src/lib/persistence/`: autoguarda el store en `localStorage` cada 3 minutos una vez completado el setup, y `Ctrl/Cmd+S` hace lo mismo. `DraftRecoveryModal` ofrece restaurar o descartar el borrador al iniciar. El borrador se **valida con Zod** antes de usarse: si no cuadra, se descarta en vez de corromper el estado.

### Setup inicial

`organisms/SetupWizardModal/`: modal de 2 pasos cuando `setupConfig.isComplete` es `false`. El paso 1 elige el `FormType` — `industria_comercio` carga la plantilla completa de ocho pasos desde `src/lib/baseTemplate/`; los otros dos (`retencion_industria_comercio` y `autorretencion`) arrancan con una fila vacía. El paso 2 pregunta si hace falta un modal introductorio y cuántos steps tiene.

### Simulador

El botón **Simulador**, al lado de "Exportar JSON", abre el formulario funcionando a pantalla completa: sin sidebar ni lienzo, como lo vería el contribuyente. Controles reales, condiciones que prenden y apagan campos, fórmulas que liquidan, grupos repetibles con agregar y quitar, y el payload de la API armándose en vivo en el panel lateral.

Lo importante es de dónde saca los datos: **consume el JSON exportado y nada más**. No lee el store del builder. Si algo falta en el contrato, el simulador se rompe igual que se rompería el aplicativo que recibe el JSON, así que sirve de prueba viva y no solo de demo.

La validación es **por paso**: "Siguiente" valida únicamente los campos de esa pantalla y no deja avanzar mientras haya errores; en el último paso el botón pasa a "Enviar". Un campo al que todavía no llegaste nunca se pinta de rojo. El panel lateral sí lista todos los errores en vivo, que es la vista global.

Tres cosas que el simulador deja a la vista:

- Los campos con opciones mapeadas no traen opciones en el JSON, porque las inyecta el consumidor desde el catálogo. El simulador genera tres opciones falsas y las marca como **catálogo simulado**.
- `logic.typeScript` **no se ejecuta**: es código arbitrario y no dice nada sobre si el formulario está bien armado.
- **No aplica los estilos del campo** — ver los gaps conocidos más abajo.

### Exportación

`src/lib/exportForm/` (`downloadFormExport`/`buildFormExport`) serializa todo a un único JSON descargable: `projectMeta`, `setupConfig.introModal` y `formSchema.steps[]`, cada step con sus `rows[].fields[]` y sus `groups[]`.

Cada campo exporta `colStart`, `colSpan`, `styles`, `validations.zodSchema`, `logic` (incluidas `formula` y `rules`), `options`, `fileConfig`, `alwaysDisabled`, `apiBinding`, `labelFor`, `content`, `tooltip`, `enableWhen` y `visibleWhen`.

Dos detalles del contrato:

- Los ids de campo en condiciones, reglas, dependencias y `labelFor` salen **resueltos a nombre**, así el consumidor no necesita el mapa de uuids.
- `validations.zodSchema` es **opcional**: los campos presentacionales lo omiten, y su ausencia es cómo el consumidor sabe que ahí no hay nada que validar.

## Gaps conocidos / no implementado

- No hay editor de código estilo Monaco para la tab de Lógica — `LogicPanel` edita `logic.typeScript` como string plano. Todo el resto de esa pestaña (fórmula, reglas, condiciones) sí tiene interfaz.
- `logic.typeScript` se exporta como string crudo; el consumidor necesita `new Function()`/`eval` para ejecutarlo. **Esto define el límite de confianza del archivo**: cualquiera que le pueda entregar un JSON al consumidor obtiene ejecución de código en él. Es una decisión coordinada, no una restricción de API pública.
- No hay versionado de schema en el borrador de `localStorage`; si cambia la forma del store, los borradores viejos se descartan al cargar. Se pierde el trabajo guardado, en silencio.
- **Renglón 35 (`valor_a_pagar`) no tiene fórmula**, así que la cadena de liquidación se corta ahí: el renglón 33 calcula un total que el 38 nunca recoge. Falta definir de dónde sale.
- **`dataSource` solo lo usan `departamento` y `municipio`.** Los demás selects de catálogo (`periodoAnio`, `idPeriodoAnual`, `idTipoDeclaracion`, `tipo_documento`, `clasificacion_contribuyente`, el `search_select` de actividad) siguen dependiendo de que el consumidor infiera el catálogo desde `apiBinding.path`. Declararlos es una entrada en `CATALOGS` y un check en el panel de mapeo, pero antes hay que acordar los nombres de catálogo con el otro proyecto. Sigue abierto: `FieldOption.id` es un uuid, así que una opción escrita a mano no tiene id de catálogo que enviar.
- Los selects mapeados a hojas `number` muestran una advertencia **`⚠ tipo`** permanente (`periodoAnio`, `idPeriodoAnual`, `idTipoDeclaracion`, `tipo_documento`, `municipio`, `clasificacion_contribuyente` y el `search_select` de actividad). El id de catálogo es numérico, pero `fieldMatchesSchemaType` no deja que un tipo con opciones case con `number`.
- Un campo del formulario no puede condicionar contra un campo del modal introductorio: la lista de candidatos sale solo de `formSteps`.
- `validations.pattern` no se valida donde se escribe. Ya no puede ejecutar nada, pero una expresión regular inválida hace fallar la construcción del schema del lado del consumidor.
- **El simulador no aplica `styles`.** Los estilos viajan en el JSON y el lienzo sí los pinta, pero el simulador dibuja controles genéricos: un campo con fondo amarillo se ve amarillo en el lienzo y gris en el simulador. Los cuatro que van por `style` (`marginTop`, `marginBottom`, `backgroundColor`, `textColor`) son un arreglo corto; `customClasses` no, por lo de abajo.
- **`styles.customClasses` funciona solo por casualidad, y al consumidor le va a pasar lo mismo.** Tailwind compila leyendo el **código fuente**. Una clase que escribís en el input "Clases CSS" vive en `localStorage` y en el JSON exportado, nunca en el fuente, así que solo se genera si algún componente ya la usaba por su cuenta. Comprobado contra el CSS compilado: `font-bold`, `text-right` y `uppercase` existen; `bg-purple-700`, `tracking-widest` y `text-2xl` no. No hay safelist ni `@source` en `index.css`. **Falla a medias**, que es la peor forma de fallar. Le pasa igual a `tooltip.customClasses`. Arreglarlo es una decisión de producto, no un parche: o una safelist de Tailwind sobre un set acotado de clases, o cambiar el campo libre por un selector.

---

`CLAUDE.md` documenta las decisiones de diseño y las razones detrás de ellas, con más profundidad que este archivo. `docs/Project.md` (en español) es la especificación de producto original — sigue siendo la referencia para la forma del JSON destino y cualquier detalle no implementado.
