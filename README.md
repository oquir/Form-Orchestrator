# Form Orchestrator

Constructor visual de formularios paso a paso ("step-by-step form builder") con drag-and-drop, que compila toda su configuración a un único documento JSON estructurado.

El caso de uso que guía el diseño es el **autoliquidable de Industria y Comercio (ICA)**: ocho pasos, cálculos encadenados entre renglones y un bloque repetible de actividades económicas. La plantilla de ICA viene armada por defecto.

## Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Zustand 5** para el estado global (canvas, steps, campos, grupos)
- **zundo** para deshacer y rehacer: el middleware de historial de Zustand
- **@dnd-kit** para drag-and-drop (paleta → fila, campo → fila, fila → nueva posición, campo o fila → otro paso)
- **zod 4** para la validación de los campos generados (los schemas Zod se generan dinámicamente por campo y se guardan como string, ej. `"z.number().min(0)"`). `react-hook-form` y `@hookform/resolvers` están instalados pero hoy no se usan: el simulador lleva sus valores en un objeto plano
- **Tailwind v4** (vía `@tailwindcss/vite`) para todo el estilado — sin CSS-in-JS. Modo oscuro por clase, con tokens de tema en `src/index.css`
- **CodeMirror 6** (`@codemirror/*`) para el editor de scripts, cargado bajo demanda
- **uuid** para generar ids de campos/filas/steps
- **reicon-react** para íconos
- **Biome** como linter/formatter (2 espacios, comillas dobles, semicolons, 100 cols, organiza imports)

Package manager: **pnpm** (la versión va fijada en `packageManager`). No usar npm/yarn/bun.

## Comandos

```bash
pnpm install      # instalar dependencias
pnpm dev          # servidor de desarrollo (Vite)
pnpm build        # typecheck (tsc -b) + build de producción
pnpm lint         # Biome check (lint + format check)
pnpm lint:fix     # Biome check con auto-fix
pnpm format       # Biome format --write
pnpm preview      # preview del build de producción
```

No hay test runner configurado, y no se va a agregar por ahora. La verificación se hace con scripts desechables que se corren con `pnpm exec tsx`.

## Arquitectura

### Estado

Un único store de Zustand, `src/store/formStore.ts` (`useFormStore`), con los constructores y recorridos en `formStore.utils.ts`. Contiene:

- `formSteps`: los steps del formulario principal, cada uno con `stepId`, `title`, `subtitle` opcional, sus `rows` y sus `groups` opcionales.
- `introModal.steps`: steps de un modal introductorio opcional, con la misma forma pero **sin** grupos.
- `activeCanvas`: qué canvas se está editando (`{ type: "formStep", stepId }` o `{ type: "introStep", stepId }`).
- `formScript`: el preludio, funciones y constantes compartidas por todos los scripts de campo.
- `setupConfig`: el tipo de formulario y la configuración del modal elegidos en el asistente.
- `selectedFieldIds` (la selección, que puede ser múltiple; `getSelectedFieldId` deduce si hay exactamente uno) y `canvasTool`.
- Estado de vista: `canvasViewMode`, `canvasZoom`, `isSidebarOpen`, `sidebarTab`, `rightSidebarTab`, `isSimulatorOpen`, `isDarkMode` y `lastSavedAt`.
- Estado de un arrastre en curso: `dragPlacement`, `rowDropTarget`, `rowDrag`, `draggingFieldId` y `hoveredTransferTarget`, más `transferNotice`, el aviso de referencias que cruzan de paso.
- Los tres bancos del simulador —`catalogBank`, `maxDates` y `valores`— vienen de `src/store/banksSlice.ts`. Se esparcen dentro del mismo store, pero no tocan el lienzo, no entran al borrador ni al export, y cada uno vive en su propia clave de `localStorage`.

Al borrador solo van `formSteps`, `introModal`, `formScript` y `setupConfig`. Lo demás se pierde al recargar, salvo `isDarkMode` y los bancos, que se guardan aparte.

El store va envuelto en el middleware `temporal` de zundo: el historial vive en un store aparte, `useFormStore.temporal` (ver "Deshacer y rehacer").

Las mutaciones de campos y filas se aplican de forma uniforme sobre cualquier canvas que contenga el id objetivo, vía `mapRowEverywhere`/`mapFieldEverywhere`, así el mismo código edita tanto el formulario principal como los steps del modal.

> **Los selectores deben devolver referencias estables.** Zustand los lee a través de `useSyncExternalStore`, que compara por identidad: un selector que devuelve un `[]` nuevo en cada llamada provoca "Maximum update depth exceeded". Para eso están las constantes `NO_ROWS`/`NO_GROUPS`/`NO_SELECTION` en `formStore.constants.ts` — nunca poner un literal de arreglo vacío dentro de un selector.

### Grilla y posicionamiento

`GRID_BASE_COLUMNS = 16` es el ancho por defecto de una fila, pero cada fila lleva su propio `columns` (entre 1 y 24). Cada campo guarda `colStart` y `colSpan`, y **ambos viajan en el JSON exportado**, así que el consumidor tiene que leerlos o el layout no sobrevive el viaje.

Las reglas viven en `src/lib/rowLayout/` como funciones puras. Tres decisiones asentadas:

- **Las colisiones se resuelven por imán, nunca empujando.** Si el rango destino pisa a un vecino, la vista previa se corre al hueco válido más cercano; si no entra en ninguno, se pone roja y el drop se rechaza. Un campo que no estás arrastrando nunca se mueve.
- **Los huecos se preservan.** Borrar o mover un campo deja su hueco; toda posición es explícita.
- **Una fila es una línea visual.** Una fila llena rechaza el campo en vez de desbordar a una segunda línea. Es una restricción deliberada, no un bug.

Manteniendo **Shift** mientras arrastras eliges la columna de inicio; con **Shift+Ctrl** además defines el ancho con el puntero.

### Barra del lienzo, herramientas y selección múltiple

Una barra flotante centrada abajo del lienzo (`organisms/CanvasToolbar/`) reúne:

- **Herramientas del puntero**: **Mover** (V, el comportamiento de siempre), **Selección múltiple** (M) y **Mano** (H). Mantener **Espacio** con el puntero sobre el lienzo activa la mano mientras dure.
- **+ Fila** y **+ Grupo repetible**, que antes estaban al pie del lienzo. Lo nuevo se agrega al final del paso y la vista se desplaza hasta ahí; el grupo queda deshabilitado en el modal de entrada.
- **Deshacer** y **Rehacer**, que también responden a **Ctrl/Cmd+Z** y a **Ctrl+Y** o **Ctrl/Cmd+Shift+Z**.
- Con **dos o más campos seleccionados**: el contador, **Mover a paso**, **Eliminar** y **Deseleccionar**.

El lienzo es **libre**: el documento tiene medio puerto de margen por lado, así que la mano, las barras y la rueda lo mueven en cualquier dirección aun al 100%. Al cambiar de paso la vista vuelve al inicio.

Con la mano o la selección múltiple el documento queda inerte: ningún campo se arrastra, se redimensiona ni abre su menú. La paleta sigue soltando campos con cualquier herramienta. En selección múltiple todo suma: un clic agrega o quita un campo, el marco agrega lo que toca y un clic en el vacío limpia. Con Mover, **Shift/Ctrl+clic** también suma, y **Ctrl/Cmd+A** selecciona todo el paso. **Supr** borra la selección sin preguntar: Ctrl+Z la recupera.

### Zoom

El lienzo va de **50% a 150%**. Se cambia con **Ctrl/Cmd+rueda** (continuo), con **Ctrl/Cmd + `+` / `-`** (de a 10%) y **Ctrl/Cmd+0** (vuelve a 100%), o desde el menú `100% ˅` del panel derecho: Acercar, Alejar y los atajos a 50, 75, 100, 125 y 150%.

Solo escala el documento; los paneles, la barra flotante y el menú contextual se quedan a tamaño real. El ancla es el centro de la vista y no el cursor, porque el zoom también llega desde el teclado y el menú. No se guarda: al recargar vuelve a 100%.

### Deshacer y rehacer

El historial guarda el documento junto con el paso activo y la selección de cada momento, así que deshacer vuelve a mostrar el cambio donde ocurrió: deshacer un "Mover a paso" devuelve los campos y también la vista al paso de origen.

- Lo que se teclea seguido cuenta como **un solo paso**; una pausa de medio segundo abre otro.
- Cambiar de paso, seleccionar, hacer zoom o cambiar de herramienta **no dejan pasos**, y tampoco una acción que no cambia nada (soltar un campo donde ya estaba).
- Dentro de un input o del editor de scripts, Ctrl+Z deshace el texto de ese control, no el formulario.
- Guarda hasta 100 pasos y **no se conserva al recargar**. Terminar el asistente o recuperar un borrador lo vacía.

Está hecho con `zundo`, el middleware de historial para Zustand.

### Reordenar filas y mudar cosas de paso

- **Reordenar una fila**: se arrastra desde la manija de su barra (la que aparece al pasar por la fila) y las demás se corren para abrirle hueco. El orden de las filas es el orden de `step.rows[]`, así que ni el borrador ni el export necesitaron nada nuevo.
- **Mudar a otro paso**: se suelta un campo o una fila sobre el número de otro paso en el panel derecho —la pestaña Steps se abre sola mientras arrastras— o, con varios campos seleccionados, se usa **Mover a paso**. Es una mudanza de verdad: mismo id, mismo nombre y referencias intactas. Una etiqueta ligada viaja con su campo; un campo cae entero, en una fila nueva si hace falta, y una fila cae al final del paso destino.
- **Las filas de un grupo repetible no salen del grupo ni cambian de paso arrastrándolas**, porque eso borraría en silencio el mapeo de todos sus campos. Entrar o salir de un grupo es una acción aparte.
- Las referencias que quedan cruzando de un paso a otro (condiciones o reglas) se avisan arriba del panel derecho y no se borran: siguen evaluándose por nombre.

### Componentes — Atomic Design

`src/components/` sigue **atoms → molecules → organisms**, más `layout/`. Cada componente y hook vive en su **propia carpeta** con archivos co-locados: `X/X.tsx`, `X/X.types.ts`, `X/X.constants.ts`, `X/X.utils.ts` (solo los que necesite). Las libs siguen el mismo patrón en `src/lib/<nombre>/`.

> Un `X.types.ts` o `X.constants.ts` es **privado a su carpeta**. En cuanto algo de afuera lo importa, la declaración pasa a `src/types/` o `src/constants/`. Ambas direcciones están auditadas en cero.

- **`atoms/`** — primitivas sin lógica de negocio: `Button`, `Checkbox`, `CodeBlock`, `CopyIconButton`, `DashedAddButton`, `FieldDragHandle`, `FieldResizeHandle`, `FieldResizeHandleBar`, `FieldResizeHandleKnob`, `FieldTypeBadge`, `IconButton`, `Input`, `Label`, `ModalActions`, `ModalShell`, `PanelHeader`, `RichTextView`, `RowDragHandle`, `SimulatorLoading`, `TextArea`, `ToggleSwitch`, `TwoColumnFieldGroup`, `WizardFooterActions`.
- **`molecules/`** — combinaciones reutilizables: `ApiPathSelect`, `BinaryChoiceToggle`, `CanvasFieldChip`, `CanvasZoomControl`, `CatalogCard`, `ColorPickerField`, `ConditionFieldSelect`, `ConditionOperatorSelect`, `ConditionValueInput`, `CssValidationHint`, `DragPreview`, `FieldIdentityCard`, `FieldNameInput`, `FieldPreviewControl`, `FieldRenameNotice`, `FieldRuleCard`, `FormSummary`, `GeneratedSchemaPreview`, `JsonCode`, `LabeledInput`, `LabeledRangeSlider`, `LabelTargetSelect`, `MaxDatesAnioRow`, `MaxDatesDeclaracionSection`, `MaxDatesPasteForm`, `PaletteChip`, `PanelBlock`, `PanelSection`, `PreviewTooltip`, `ProjectFilePicker`, `PxInput`, `RichTextEditor`, `RowDragPreview`, `RowZoneOverlay`, `RuleEffectRow`, `ScriptEditor`, `ScriptInput`, `SelectableOptionCard`, `SelectionSummary`, `SidebarTabRail`, `StepTabChip`, `TabButtonGroup`, `TooltipBubble`, `TransferNotice`, `ValidationOverrideCard`, `ViewModeSwitch`.
- **`organisms/`** — secciones autocontenidas: `Canvas`, `CanvasRow`, `CanvasRowsGrid`, `CanvasTabs`, `CanvasToolbar`, `CanvasToolLayer`, `DraftRecoveryModal`, `FieldContextMenu`, `FieldOptionsModal`, `FieldPalette`, `FormBuilder`, `FormSimulator`, `JsonPreviewCanvas`, `MoveToStepMenu`, `PayloadPreviewCanvas`, `ProjectImportModal`, `RepeatableGroupBand`, `RightSidebar`, `RowColumnsMenu`, `RowStylesMenu`, `RowToolbar`, `SaveButton`, `SetupWizardModal`, `Sidebar`, `StepTitleEditor`. Además:
  - `organisms/panels/`, paneles y editores: `ApiMappingPanel`, `AttributesPanel`, `CatalogFillsEditor`, `CatalogsPanel`, `ConditionEditor`, `FieldDataSourceEditor`, `FieldOptionsEditor`, `FieldRulesEditor`, `FieldScriptEditor`, `FieldTooltipEditor`, `FileOptionsEditor`, `FormScriptEditor`, `GroupChecksEditor`, `LogicPanel`, `MaxDatesPanel`, `NumberOptionsEditor`, `StylesPanel`, `ValidationOverridesEditor`, `ValidationsPanel`, `ValoresAnualesEditor`.
  - `organisms/preview/`, las piezas del simulador: `PreviewField`, `PreviewFieldControl`, `PreviewForm`, `PreviewGroupBand`, `PreviewNumberInput`, `PreviewResults`, `PreviewRowsGrid`, `PreviewSearchSelect`, `PreviewStep`.
- **`layout/AppLayout.tsx`** — el shell de la app, con cuatro espacios. Va fuera de la jerarquía atómica porque es el layout raíz.

### Layout

`AppLayout` reparte la pantalla en cuatro espacios: `sidebar`, `canvas`, `canvasOverlay` y `rightSidebar`.

- **Sidebar izquierdo** (`organisms/Sidebar/`): un rail vertical de íconos (`SidebarTabRail`, incluye el toggle de modo oscuro) más el panel correspondiente. Las pestañas son Campos, Atributos, Validaciones, Estilos, Lógica, Mapeo API, Catálogos y Fechas. Campos, Catálogos, Fechas y Lógica funcionan sin ningún campo seleccionado — en Lógica, sin selección, se edita el preludio del formulario. Al hacer clic sobre la pestaña ya activa, el panel se colapsa; el rail siempre queda visible.
- **Lienzo** (`organisms/Canvas/`): ocupa todo el alto de la ventana como lienzo libre. Una grilla por fila (`@dnd-kit` `useDroppable`), redimensionado de campos por arrastre y menú contextual por campo. Al pasar por una fila aparece su barra (`RowToolbar`): manija para arrastrarla, columnas, estilos de la fila y eliminar. El modal de entrada se dibuja dentro de un marco decorativo de modal. En las vistas JSON y Payload el lienzo se reemplaza por `JsonPreviewCanvas` (vista previa en vivo del export) o `PayloadPreviewCanvas` (cobertura del contrato).
- **Barra flotante** (`organisms/CanvasToolbar/`): va en `canvasOverlay`, al lado del lienzo y no adentro, así que ni se desplaza ni escala con él. Ver "Barra del lienzo, herramientas y selección múltiple".
- **Panel derecho** (`organisms/RightSidebar/`): sigue el modelo del panel derecho de Figma y tiene ancho fijo; no se colapsa.
  - Arriba, la fila de acciones: **Guardar** a la izquierda; **Simulador** y **Exportar** a la derecha.
  - Debajo, las pestañas **Proyecto** y **Steps**, con el zoom a la derecha (solo en la vista Lienzo).
  - **Proyecto**: "Vista", para elegir entre Lienzo, JSON y Payload, y "Formulario", con el tipo de formulario, cuántos steps, pasos de modal y campos tiene, y si está guardado. El bloque Formulario trae **Abrir…**, que carga un JSON exportado en lugar del formulario actual (ver "Abrir un formulario exportado").
  - **Steps**: "Pasos", la grilla de chips numerados para cambiar de paso (**+** agrega uno y la **✕** del chip activo lo borra), y "Paso activo", con su título y subtítulo. Mientras arrastras un campo o una fila esta pestaña se abre sola, porque sus chips son donde se suelta para mudar algo a otro paso.
  - El aviso de referencias que cruzan de paso (`TransferNotice`) aparece arriba de las dos pestañas.

El wiring de drag-and-drop vive en `src/hooks/useDragAndDrop/`; el `DndContext`/`DragOverlay` los arma `organisms/FormBuilder/`, que es lo único que envuelve al `AppLayout`.

`App.tsx` no dibuja nada del constructor: es la compuerta de arranque. Monta los hooks globales (`useThemeClass`, `useAutosave`, `useKeyboardShortcuts`) y decide qué mostrar en este orden — `DraftRecoveryModal` si hay borrador, `SetupWizardModal` si el setup no está completo, `FormBuilder` si ya lo está. `FormBuilder`, a su vez, cambia todo por `FormSimulator` cuando se abre el simulador.

### Hooks

Cada hook vive en su propia carpeta, igual que los componentes:

- **Arranque y estado global** — `useThemeClass` (aplica la clase `dark` en el `<html>`), `useAutosave`, `useKeyboardShortcuts` (Ctrl/Cmd+S, zoom, herramientas V/M/H, Espacio sostenido, Supr, Esc, Ctrl/Cmd+A, deshacer y rehacer), `useDraftRecovery`, `useProjectImport` (abrir un JSON exportado, desde el asistente o desde el panel derecho), `useFormHistory` (si hay algo que deshacer o rehacer, leído del historial de zundo).
- **Interacción del canvas** — `useDragAndDrop`, `useFieldResize`, `useFieldContextMenu`, `usePayloadPreviewCanvas`, `useCanvasViewport` (lienzo libre y zoom), `useCanvasPan` (la mano), `useCanvasMarquee` (el marco de selección).
- **Paneles** — `useConditionEditor` (compartido por los dos editores de condición), `useFieldRules`, `useSetupWizard`, `useSaveButton`, `useRichTextEditor`, `useJsonCode`, `useCatalogCard`, `useApiMappingPanel`, `useFormScriptEditor`, `useFieldScriptEditor`, `useGroupChecksEditor`.
- **Simulador** — `useFormPreview` (el único que toca el store, y solo para alimentar el export), `usePreviewNavigation`, `usePreviewSearchSelect`.
- **Genéricos** — `useClickOutside`.

### Tipos de campo

Se declaran en `FIELD_TYPES` (`src/constants/fieldTypes.ts`) y se agrupan por categoría, que es lo que dibuja la paleta:

- **Básicos** — `text`, `number`, `select`, `textarea`, `checkbox`, `calculated`, `file`.
- **Complejos** — `search_select`, `toggle_group`, `radio_group`, `checkbox_group`.
- **Contenido** — `label`, `rich_text`.

`checkbox` y `checkbox_group` son tipos distintos a propósito: el primero es un booleano único, el segundo es multi-selección con `options[]`.

`radio_group` y `checkbox_group` pueden declarar `inlineOptions: true` para poner sus opciones en una sola línea en vez de apiladas; se prende en Atributos, sección Diseño. Es solo presentación y usa `flex-wrap`, así que no promete que todo quepa. `toggle_group` ya es horizontal y `select` no tiene dónde ponerlas.

### Campos presentacionales

Los tipos de la categoría Contenido **no reciben ningún valor**: solo muestran texto. Conservan estilos, tamaño, posición y visibilidad condicional; no tienen validaciones, no se mapean al payload, no generan schema Zod y no aparecen como candidatos de condición ni de script. El predicado es `isPresentationalField` (`src/lib/fieldKind/`).

- **`label`** — una etiqueta suelta que puede **ligarse a un campo** vía `labelFor`. El campo ligado deja de mostrar su propia etiqueta. La relación es 1:1 y se limpia sola si borras el campo destino.
- **`rich_text`** — un bloque de texto con negrita, cursiva, subrayado y enlaces. **El contenido se guarda estructurado, no como HTML**, así el consumidor lo pinta con componentes y nunca necesita `dangerouslySetInnerHTML`. El serializador funciona como sanitizador: recorre el DOM con lista blanca, y los enlaces solo admiten `http`, `https` y `mailto`.

### Tooltips de ayuda

Ocho tipos de campo pueden llevar un **tooltip**: `text`, `number`, `select`, `checkbox`, `calculated`, `file`, `toggle_group` y `radio_group` (`TOOLTIP_CAPABLE_FIELD_TYPES`). El predicado es `supportsTooltip` (`src/lib/fieldTooltip/`). El resto no lo ofrece a propósito.

El tooltip lleva `content`, `position` (`top` | `bottom` | `left` | `right`) y un `customCss` opcional (CSS plano, no clases de Tailwind — ver "Estilos"). El `content` es **el mismo `RichTextContent` estructurado que usa `rich_text`**, así que admite negrita, cursiva, subrayado y enlaces, pasa por el mismo sanitizador y el consumidor lo pinta con los mismos componentes — nunca con `dangerouslySetInnerHTML`.

Lo que debe hacer el consumidor: si el campo trae `tooltip`, dibujar un **ícono de información junto a la etiqueta visible** y mostrar el contenido en `position` al hacer hover o tap sobre ese ícono. El disparador es el ícono, no el campo entero: se descubre a simple vista, funciona en celular y no tapa lo que el contribuyente va a tocar. Si el campo tiene su etiqueta ligada por `labelFor`, el ícono va junto a **esa** etiqueta.

En el lienzo del builder el ícono aparece igual, pero la burbuja se previsualiza al pasar el mouse por el campo completo, para poder juzgar la posición elegida sin tener que apuntarle al ícono.

Un tooltip cuyo contenido queda vacío **no se exporta**: `exportableTooltip` lo descarta, igual que `exportableOptions` con las opciones.

### Estilos

Campos, filas y tooltips llevan **CSS plano, no clases de Tailwind**: `customCss` guarda texto como `"font-weight: 700; text-align: right;"`. Tailwind v4 arma sus clases escaneando el código fuente al compilar, así que una clase escrita dentro del builder solo funcionaba si por casualidad ya la usaba algún componente.

- Un campo suma propiedades con nombre: `backgroundColor`, `textColor`, `marginTop` y `marginBottom`. Una fila solo admite los márgenes y `customCss`, a propósito: una fila es layout, no algo que se lee. Los estilos de la fila se editan desde el menú de su barra.
- **El texto libre gana**: se aplica encima de las propiedades con nombre, como en la cascada normal, así que el lienzo pinta lo mismo que va a pintar el consumidor.
- El export entrega **un solo objeto `style` ya resuelto** por campo, fila y tooltip (`textColor` sale como `color`). No hace falta sanitizador: CSS dentro de `style` no ejecuta nada. Una declaración que el navegador no reconoce solo se avisa.
- La posición en la grilla siempre gana: `gridColumn` va en un nodo distinto al del CSS del autor.

### Redondeo al millar

Un campo `number` o `calculated` puede declarar `rounding: true` y su valor se **aproxima al múltiplo de mil más cercano**: `499` baja a `0`, `500` sube a `1.000`, `1.499` baja a `1.000`. Es la regla que aplica toda declaración tributaria a sus renglones. Se prende con un switch en la pestaña Atributos y el predicado es `supportsRounding` (`src/lib/fieldRounding/`).

**Cambia el valor, no cómo se ve.** Lo que se guarda, lo que leen los demás campos y lo que viaja en el payload es el número ya aproximado; no hay un valor "crudo" guardado en paralelo.

Se aplica en dos momentos, según quién produjo el valor:

- Lo que **escribe el usuario** se redondea al salir del campo. Aproximar en cada tecla haría imposible tipear.
- Lo que **produce un script o una regla** se redondea apenas se calcula, y ese es el valor que lee el campo de abajo. Un campo calculado va deshabilitado y un input deshabilitado nunca dispara blur, así que este es su único camino.

Es un booleano y no un múltiplo configurable a propósito: en los formularios que existen el redondeo siempre fue al millar o no existió. El múltiplo vive en una constante de la librería.

Dos detalles que importan: un campo vacío **no** se convierte en `0` al salir de él, y los negativos se aproximan por magnitud, así que un saldo a favor de `−1.500` va a `−2.000` igual que uno a cargo va a `2.000`.

En la plantilla de ICA está prendido en los 34 renglones de valor. Quedan afuera cuatro campos numéricos que no son plata: `tarifa_x_mil` y `dv` (redondeados darían `0`), `numero_establecimientos` (un conteo) y `generacion_energia_kw` (renglón 18, pero son kilovatios de capacidad instalada).

### Separador de miles y decimales

Un campo `number` o `calculated` puede declarar `formatted: true` y su valor se **muestra con punto de miles y coma decimal**: `1000` se ve `1.000` y `1.5` se ve `1,5`. Se prende con un switch en la pestaña Atributos, al lado del redondeo.

**Esto sí es solo presentación**, a diferencia del redondeo: el texto formateado **nunca sale del input**. El estado guarda un número de verdad y el `1.000` existe solo en pantalla, mientras el campo no está enfocado. No es un detalle de estilo — `buildPayload` mete el valor en el JSON sin parsearlo y los scripts lo leen con `parseFloat`, y `parseFloat("1.000")` es `1`. Un valor formateado que se filtrara al estado sería un error de tres órdenes de magnitud, en silencio.

Al enfocar el campo se ve sin agrupar (`1000`), para poder editarlo; al salir se vuelve a formatear.

Un detalle que sorprende: **el input no puede ser `type="number"`**. Por spec de HTML el valor tiene que ser un número de punto flotante válido, donde el punto es el separador **decimal**: ahí `"1.000"` vale uno y `"1.000,5"` es inválido y deja el campo en blanco. El control es `type="text"` con `inputMode="decimal"` —el teclado numérico del celular sigue apareciendo— y un filtro propio que solo deja pasar dígitos, punto, coma y un menos adelante. Ese filtro es **más estricto** que el rechazo nativo, que aceptaba la `e` de la notación científica.

Un punto es siempre separador de miles, nunca decimal, que es lo que hace que `1.000` sean mil. La contra conocida: quien tipee `1.5` con la costumbre inglesa obtiene `15`.

En la plantilla de ICA está prendido en los 38 campos numéricos, incluidos los cuatro que no redondean: una tarifa de `1,5` también se lee mejor así.

### Decimales

`decimals` dice **cuántos decimales muestra y deja teclear** un campo numérico. Sin declarar, muestra los que traiga (hasta 4). Con `0`, la coma no se puede escribir. Con `1`, una tarifa de 6 se muestra `6,0`.

| valor | `decimals` | se ve |
|---|---|---|
| `1000` | 0 | `1.000` |
| `1000` | 2 | `1.000,00` |
| `6` | 1 | `6,0` |
| `7.5` | 1 | `7,5` |
| `6` | *sin declarar* | `6` |

**Rellenar con ceros es presentación; recortar cambia el valor.** Mostrar `6` como `6,0` no puede mentir, porque son el mismo número. Mostrar `1234,56` como `1.235` guardando `1234,56` sí mentiría, así que el recorte redondea el valor de verdad, igual que el redondeo al millar.

Un detalle práctico: con `decimals: 0`, pegar `1234,56` da `1234` — se corta **en** la coma, no se le saca la coma, que daría `123456` y sería el valor equivocado por dos órdenes de magnitud.

En la plantilla de ICA todos los numéricos van en `0` —la declaración no lleva decimales en ningún renglón— y `tarifa_x_mil` es la única en `1`, para que la columna se lea pareja: `4,0 / 7,5 / 6,0`.

### Valores negativos

Un campo `number` o `calculated` puede declarar que **no admite negativos**, y eso se hace valer en dos lugares distintos, porque hay dos maneras de que aparezca un negativo:

- **Al escribir** — no deja tipear el signo menos, ni pegarlo desde el portapapeles.
- **Al calcular** — si el script da negativo, el valor se **recorta a 0**. Por ejemplo: `1.000.000 − 2.000.000` da `−1.000.000` y el campo guarda `0`.

Igual que el redondeo, **recorta el valor y no solo la vista**: mostrar `0` mientras se guarda `−1.000.000` dejaría la pantalla y el payload diciendo cosas distintas, y el campo de abajo leería el negativo que nadie ve. Cuando esto pasa el simulador lo avisa bajo el campo, para que un `0` no aparezca sin explicación.

**Ojo con la polaridad, que es al revés que las otras dos propiedades numéricas:** `allowsNegative` **ausente significa que sí admite**. Solo `allowsNegative: false` restringe. Es a propósito — si la ausencia restringiera, todo borrador ya guardado y todo campo recién soltado de la paleta empezarían a recortar en silencio.

En la plantilla de ICA lo tienen apagado 27 de los 38 campos numéricos: los 25 `number` y los dos calculados que pueden dar negativo de verdad — renglones 10 y 16. Los otros once calculados quedan libres: unos son sumas de no-negativos, los renglones 33, 34 y 38 ya se recortan solos con su `max(…, 0)`, el 35 hereda el recorte del 33 y el 40 suma el 38 con un aporte voluntario que declara `min: 0`.

Recortar con esta propiedad y recortar dentro del script no es lo mismo: la propiedad avisa en el simulador, y en el renglón 38 ese aviso saltaría con cada saldo a favor, que es un caso normal y no un error.

### Longitud máxima

`validations.maxLength` se ofrece en `text`, `textarea`, `number` y `calculated`, y **cuenta distinto según el tipo**: caracteres en los de texto y **dígitos de la parte entera** en los numéricos. En un número se cuentan dígitos y no caracteres porque el texto en pantalla cambia con el separador de miles, el signo y los decimales.

- **Nunca cambia el valor.** Al escribir, el teclado no deja pasar el carácter de más; un campo calculado que se pasa **falla la validación** en vez de recortarse en silencio.
- Viaja dos veces a propósito: dentro del schema, que es lo único con lo que valida el consumidor, y como `maxLength` propio del campo, para frenar el tecleo antes de que el valor exista.
- Un tope de `0` se lee como ausente; si no, un campo numérico quedaría imposible de llenar.

La plantilla de ICA no declara ninguno: el largo de los documentos ya va en su `pattern`.

### Grupos repetibles

Un grupo repetible es una **marca sobre la fila** (`CanvasRow.groupId`), no un contenedor anidado. Gracias a eso el drag-and-drop, el redimensionado y todas las reglas de posicionamiento siguen funcionando dentro del grupo sin ningún cambio: los campos de una actividad se mueven y reordenan libremente.

Cada grupo lleva `min`, `max` y un `arrayPath` que lo ata a un arreglo del contrato (por defecto 1 a 15 sobre `actividades`, la regla de ICA, pero es parametrizable). Sacar un campo del grupo dentro del mismo paso limpia su mapeo, porque una ruta dentro del item no significa nada afuera; mudarlo a otro paso todavía no lo limpia (ver gaps).

#### Comprobaciones del grupo (`checks`)

Un grupo puede llevar **comprobaciones sobre el grupo entero**: un script que se evalúa una sola vez, en el ámbito raíz, donde la columna del grupo es el arreglo completo. **Verdadero pasa; falso muestra el mensaje** y no deja avanzar de paso.

```js
return abs(sum({ingresos_gravados}) - {total_ingresos_gravables}) < 1;
```

Es la regla que trae la plantilla de ICA: lo declarado por actividad tiene que sumar lo mismo que el renglón 16. Viene prendida, porque olvidarse de activarla dejaría pasar la evasión sin aviso. Compara con tolerancia de un peso y no con `===`, por la coma flotante.

- La dueña es el grupo y no el renglón 16: el paso de actividades no tiene un campo raíz donde colgar el error, y colgarlo en el 16 bloquearía un paso antes de que exista alguna actividad.
- **Una comprobación rota nunca bloquea**: si el script tira un error o devuelve `undefined`, se reporta como problema del autor y pasa.
- Una comprobación apagada **no se exporta**.
- Se edita desde la banda del grupo, en su sección colapsable (`GroupChecksEditor`).

### Cálculo: el script del campo

**El valor de un campo se calcula en un solo lugar: `logic.script`**, JavaScript con `{campo}` para leer otros campos.

```js
return {total_ingresos_nacionales} - {ingresos_fuera_municipio};
```

Antes había tres mecanismos compitiendo por la misma pregunta: un lenguaje aritmético propio, un editor de reglas y un textarea de "script TypeScript" que se exportaba y nunca se ejecutaba. Ahora hay uno.

El contrato:

- **`return` da el valor del campo. `return undefined` deja lo que haya escrito el usuario** — el campo no queda marcado como calculado y sigue siendo editable.
- En ámbito: `value` (el valor actual del campo), `index` (la repetición dentro de un grupo) y los helpers `num`, `sum`, `count`, `abs`, `min`, `max`, `round`, `floor`, `ceil` y `dvNit`, más los que leen las tablas del simulador: `fechaLimite`, `diasDeMora`, `mesesDeMora`, `uvt` y `smmlv` (ver "Fechas máximas de presentación" y "UVT y SMMLV").
- Dentro de un grupo repetible, `{hermano}` es el escalar de esa fila; desde afuera, `{columna}` es el arreglo completo. `sum` aplana arreglos, así que un total de columna es `sum({impuesto_actividad})`.
- Un resultado no finito sale como `null`, que es como se comporta la división por cero.

**Solo se sustituye `{x}` cuando `x` es el nombre de un campo que existe.** Esa única regla es la que deja convivir la sintaxis con JavaScript: un `const {a} = obj` queda intacto. Por eso una referencia desconocida es un **aviso y no un error** — no hay forma de distinguir un typo de una desestructuración.

El **preludio** (`formScript`) es del formulario entero: funciones y constantes que todos los scripts ven en ámbito, para los cálculos que se repiten en varios renglones. Se edita en la pestaña Lógica sin ningún campo seleccionado. **No puede leer campos**: los valores entran por parámetro.

Las **reglas** (`FieldRule`) sobrevivieron a propósito: no son otro lenguaje sino una estructura declarativa —condición más efecto— y su efecto habla el mismo script. Corren **después** del script del campo y pisan lo que haya devuelto, en el orden de la lista.

`src/lib/fieldGraph/` unifica **cuatro** fuentes de dependencias en un solo grafo —`visibleWhen`, `enableWhen`, las condiciones de las reglas y las referencias `{campo}` del script y de los efectos— y detecta ciclos. En el editor de script el ciclo se **avisa**, no se bloquea: es texto libre y trabar la escritura a mitad de una palabra sería pelearse con quien escribe.

El editor es **CodeMirror 6** con resaltado, autocompletado de campos al escribir `{` y subrayado de las referencias que no existen. Va detrás de un `React.lazy`: son 457 kB que no se bajan hasta abrir la pestaña Lógica, con el textarea de siempre como respaldo mientras tanto.

Los ejemplos más completos de la plantilla son los renglones 31 y 37: ver "Sanción por extemporaneidad" e "Intereses de mora".

### Condiciones

Cada campo lleva dos condiciones independientes: `visibleWhen` decide si **se dibuja**, `enableWhen` si es **editable**. El orden de precedencia que debe aplicar el consumidor es: si `visibleWhen` da falso el campo no se renderiza ni se valida; si no, `alwaysDisabled` lo deja de solo lectura; si no, `enableWhen` decide si va deshabilitado.

### Validaciones condicionales (`validations.overrides`)

La validación de un campo puede cambiar según el valor de otro. Cada override es `{when, validations}` y **se mezcla sobre la validación base** en vez de reemplazarla: lo que el override deja vacío se hereda de la base.

El caso que lo motivó: el número de documento acepta de 6 a 10 dígitos, pero cuando el tipo de documento es NIT acepta de 6 a 9, porque el décimo es el dígito de verificación y va en su propio campo. En los dos casos rechaza los que arrancan en cero o repiten un solo dígito. En la plantilla lo llevan los tres documentos —contribuyente, declarante y responsable—, cada uno mirando su propio tipo de documento.

Se exporta como `validations.zodSchemaWhen: [{when, zodSchema}]`, al lado de `zodSchema`. **El consumidor recorre la lista en orden y valida con el primer schema cuya condición se cumpla; si ninguna se cumple, usa `zodSchema`.**

Se edita en la pestaña Validaciones (`ValidationOverridesEditor`).

### Mapeo al payload

`PAYLOAD_SCHEMA` (`src/constants/payloadSchema.ts`) es el contrato real de `DeclaracionIcaE`. Cada campo se marca como **mapeado** a una hoja del contrato, **excluido** del payload, o queda sin definir. `PayloadPreviewCanvas` muestra la cobertura: qué hojas están cubiertas, cuáles no, y qué campos apuntan a rutas que ya no existen. Hay un solo contrato: el panel ofrece las hojas de ICA sea cual sea el tipo de formulario (ver gaps).

Los campos con opciones solo admiten opciones escritas a mano **cuando están excluidos del payload y no declaran un catálogo**. En cualquier otro caso las inyecta en tiempo de ejecución el aplicativo receptor.

### De dónde salen las opciones (`dataSource`)

`dataSource` es `{catalog, dependsOn?, fills?}` y responde **de dónde salen las opciones**, mientras que `apiBinding` responde **si el valor viaja en el payload**. Son preguntas independientes: `departamento` está excluido (la API solo quiere `idCiudad`, porque el municipio ya implica el departamento) y aun así necesita consultar el catálogo `departamentos`.

Precedencia que aplica el consumidor, en este orden:

1. Si el campo trae `options[]`, se usan. Solo se exportan para campos excluidos sin catálogo.
2. Si trae `dataSource`, se consulta `dataSource.catalog`. Si además trae `dependsOn`, se pasa el valor actual de ese campo como parámetro y no se ofrece nada hasta que lo tenga.
3. Si no trae ninguno y está mapeado, se infiere el catálogo desde `apiBinding.path`.

`options[]` y `dataSource` **nunca viajan juntos**: `allowsManualOptions` devuelve `false` en cuanto hay catálogo, así que el export descarta las opciones y el schema Zod cae a `z.string()` en vez de congelar valores viejos. El catálogo se elige de una lista cerrada (`CATALOGS` en `src/constants/catalog.ts`), no se escribe a mano, por la misma razón que la ruta se elige de `PAYLOAD_SCHEMA`.

El par real hoy es `departamento` → `municipio`: el segundo declara `{catalog:"municipios", dependsOn:"departamento"}` y un `enableWhen` con `isNotEmpty`, así que arranca deshabilitado y su catálogo se consulta filtrado.

En la plantilla de ICA, 10 campos declaran su catálogo; `periodo_anio`, `clasificacion_contribuyente` y `tipo_representante` todavía dependen de la inferencia por ruta.

#### Rellenar otros campos (`fills`)

Hay campos que **no se escriben: se llenan solos** con datos de la opción elegida. El código CIIU y la tarifa de una actividad son eso — el contribuyente elige la actividad en el buscador y los dos campos, que están en solo lectura, muestran lo que trae el catálogo.

Eso se declara en el campo que **origina** la selección:

```json
"dataSource": {
  "catalog": "actividades",
  "fills": [
    { "column": "code",   "field": "codigo_actividad" },
    { "column": "tarifa", "field": "tarifa_x_mil" }
  ]
}
```

Las columnas son las que devuelve el catálogo (`id`, `label`, `code`, `tarifa`) y el destino viaja por nombre. Se declara en el origen y no en los destinos por la misma razón que `labelFor`: un solo dueño, sin dos puntas que mantener sincronizadas.

Lo que debe hacer el consumidor: al elegir una opción, copiar esas columnas a esos campos **de la misma repetición**; al limpiar la selección, vaciarlos. Si una columna no viene, el destino se vacía — dejar la tarifa de la actividad anterior es peor que no mostrar nada, porque el impuesto se seguiría calculando con ella.

Se edita desde la pestaña Atributos, en la sección Origen de opciones.

### Banco de catálogos

La pestaña **Catálogos** del sidebar guarda las opciones que el simulador ofrece en cada campo de catálogo. Se cargan **pegando la respuesta del endpoint** e indicando qué campo es el id, cuál la etiqueta y, en catálogos parametrizados, cuál apunta al padre.

Vive en su propia clave de `localStorage` (`form-orchestrator-catalogs`): **no entra al borrador ni al JSON exportado**, y se comparte entre formularios — los departamentos que cargues una vez los usa también el formulario de retención, porque la unidad es el catálogo y no el campo.

Cada catálogo tiene su propio interruptor **Por defecto / Personalizado**. Volver a "Por defecto" **no borra lo cargado**, solo lo ignora: puedes probar con los datos de prueba del simulador y regresar a los reales sin volver a pegar el JSON. Un catálogo que nunca cargaste usa siempre los datos de prueba.

En el simulador, la etiqueta **"Catálogo simulado"** debajo de un campo indica que sus opciones son inventadas. Si el catálogo está en modo personalizado, la etiqueta desaparece — así se ve, campo por campo, con qué datos estás probando.

### Fechas máximas de presentación

La pestaña **Fechas** guarda la tabla de vencimientos del municipio: `{municipioId, ica[], reteica[], autoretencionIca[]}`, con los nombres en español porque ese objeto **es** el contrato de la API. Igual que los catálogos, vive en su propia clave (`form-orchestrator-fechas`) y **no entra al borrador ni al export**.

- La tabla generada de ICA se recalcula con la fecha de hoy y es de solo lectura. Editar cualquier cosa crea una copia personalizada, para que la próxima regeneración no se lleve lo editado.
- ReteICA y autorretención vienen **vacías**: inventar vencimientos que nadie dio sería el mismo error que inventar tarifas.
- Se carga pegando el objeto completo. A mano solo se edita el caso anual sin validación por dígito; el resto se pega.

Los scripts la leen con tres helpers, que reciben el año, el período dentro del año y el documento. Según el municipio y el año, la periodicidad es anual, bimestral, trimestral o mensual, y el vencimiento puede depender del primer o del último dígito del documento:

| helper | devuelve |
|---|---|
| `fechaLimite(año, periodo, documento)` | la fecha límite, o `null` si no la encuentra |
| `diasDeMora(año, periodo, documento)` | los días de atraso; `0` si está a tiempo **o si no hay tabla** |
| `mesesDeMora(año, periodo, documento)` | los meses o fracción de atraso, contados por calendario |

`mesesDeMora` **no es `diasDeMora / 30`**: solo cuatro meses tienen 30 días, y dividir termina cobrando un mes de más, que en la sanción es un 5% de la base. Como `diasDeMora` da `0` tanto a tiempo como sin tabla, un script que necesita distinguir los dos casos pregunta primero por `fechaLimite`.

La fecha de hoy entra como parámetro y no se lee del reloj, y las fechas se arman a mano en UTC: según la zona horaria, `new Date` puede correr un día, y aquí un día decide si hubo mora.

### UVT y SMMLV

La primera sección de la pestaña Catálogos (`ValoresAnualesEditor`) guarda la UVT y el salario mínimo de cada año (`{anio, uvt, smmlv}`), en su propia clave (`form-orchestrator-valores`) y fuera del borrador y del export. De fábrica trae de 2020 a 2026, con las cifras publicadas por la DIAN y los decretos; se pueden pegar otras, nombrando las columnas.

Los scripts la leen con `uvt(año)` y `smmlv(año)`; sin argumento toman el año actual. **Devuelven `null`, no `0`, cuando el año no está cargado**: un `0` anularía en silencio cualquier mínimo escrito en UVT, y el `null` obliga a escribir un respaldo visible:

```js
const UVT = uvt() ?? 52374;
```

### Sanción por extemporaneidad (renglón 31)

La sanción del art. 641 del Estatuto Tributario **se autoliquida**, y la regla completa vive **dentro del script del renglón 31**: parámetros del municipio arriba, cálculo abajo. La plantilla solo siembra el texto inicial; de ahí en adelante es un script normal que edita el autor del formulario.

Los parámetros vienen en el techo legal, porque la ley fija un máximo que el municipio solo puede bajar: mínimo de **10 UVT**, **5% por mes** o fracción de atraso y tope del **100%** de la base. La base es el **renglón 25**, el impuesto a cargo.

- **No se reparte entre el script y el preludio, a propósito.** Cuando un municipio pide cambiar el 5% o la base, quien atiende el pedido abre el renglón 31 y ve la regla entera; si la mitad viviera en otro lado, habría que saberlo de antemano.
- Solo la extemporaneidad se autoliquida. Para los otros tipos de sanción el script devuelve `undefined` y el campo se sigue pudiendo escribir; por eso el renglón es `number` y no `calculated`.
- Sin atraso no hay sanción, y esa salida va antes del mínimo: el mínimo es el piso de una sanción que existe, no crea una.
- La base no puede ser el 33, 34, 35 ni 38: todos incluyen este renglón en su cuenta y se armaría un cálculo circular.

No está hecho: la sanción por corrección (art. 644) y la gradualidad (art. 640), que necesitan la declaración anterior; el art. 642, que necesita saber si hubo emplazamiento; y las ramas del art. 641 sobre ingresos brutos y patrimonio líquido.

### Intereses de mora (renglón 37)

Mismo criterio que la sanción: la regla entera en el script del renglón 37. La fórmula (arts. 634 y 635 del ET) es interés simple diario, `base × (TASA_ANUAL / DIAS_ANIO) × días`, redondeado hacia arriba al millar.

- La tasa es la de usura que certifica la Superfinanciera menos 2 puntos, y **cambia todos los meses**. Se aplica la vigente al momento del pago a todo el atraso, por eso alcanza con una constante. La plantilla trae la de agosto de 2026 (27,66% efectiva anual), y hay que actualizarla.
- La base por defecto es el **renglón 35**: ya viene recortado, así que con saldo a favor vale 0 y no se cobran intereses sobre una deuda que no existe. Se cambia en una línea; el único renglón prohibido es el 38, que consume estos intereses.
- **Redondea hacia arriba** (`ceil`), a diferencia del resto de los renglones, igual que el `ROUNDUP(…;-3)` con el que se liquida.
- Si no hay fecha límite con la cual comparar, devuelve `undefined` y el campo queda escribible: un `0` bloqueado se confundiría con un cálculo que dio cero.

### Persistencia

`src/hooks/useAutosave/` + `src/lib/persistence/`: autoguarda el store en `localStorage` cada 3 minutos una vez completado el setup, y `Ctrl/Cmd+S` hace lo mismo. `DraftRecoveryModal` ofrece restaurar o descartar el borrador al iniciar.

Al borrador van `formSteps`, `introModal`, `formScript` y `setupConfig`, bajo la clave `form-orchestrator-draft`. Hay **uno solo por navegador**; para llevar el proyecto a otro computador o a otra persona está el archivo exportado (ver "Abrir un formulario exportado"). El tema y los bancos del simulador van cada uno en su propia clave.

El borrador lleva **versión de esquema** y se **migra antes de validarse con Zod**: un borrador guardado por una versión anterior de la app se actualiza en vez de perderse. Si aun así no cuadra, se descarta entero en vez de corromper el estado — y se avisa, no se pierde en silencio.

### Setup inicial

`organisms/SetupWizardModal/`: modal de 2 pasos cuando `setupConfig.isComplete` es `false`. El paso 1 elige el `FormType` — `industria_comercio` carga la plantilla completa de ocho pasos desde `src/lib/baseTemplate/`; los otros dos (`retencion_industria_comercio` y `autorretencion`) arrancan con una fila vacía. El paso 2 pregunta si hace falta un modal introductorio y cuántos steps tiene.

En Industria y Comercio, el modal de la plantilla trae dos pasos: "Seleccione año gravable y período" y "Seleccione tipo de declaración". El asistente lo deja como opcional, pero los renglones 31 y 37 lo necesitan (ver gaps).

El paso 1 ofrece además **Cargar formulario**, que no crea nada: abre un JSON exportado y el proyecto entero sale del archivo (ver "Abrir un formulario exportado").

### Simulador

El botón **Simulador**, en la fila de acciones del panel derecho, abre el formulario funcionando a pantalla completa: sin sidebar ni lienzo, como lo vería el contribuyente. Controles reales, condiciones que prenden y apagan campos, scripts que liquidan, grupos repetibles con agregar y quitar, y el payload de la API armándose en vivo en el panel lateral.

Lo importante es de dónde saca los datos: **consume el JSON exportado y nada más**. No lee el store del builder. Si algo falta en el contrato, el simulador se rompe igual que se rompería el aplicativo que recibe el JSON, así que sirve de prueba viva y no solo de demo.

La validación es **por paso**: "Siguiente" valida únicamente los campos de esa pantalla y no deja avanzar mientras haya errores; en el último paso el botón pasa a "Enviar". Un campo al que todavía no llegaste nunca se pinta de rojo. El panel lateral sí lista todos los errores en vivo, que es la vista global.

Cosas que conviene saber:

- **Las opciones de catálogo salen, en este orden,** del banco de catálogos si ese catálogo está en modo personalizado; si no, de los datos de prueba del simulador, en su mayoría transcritos de volcados reales de la API con sus ids reales, porque las condiciones comparan contra esos ids (en `tipo_documento`, `"2"` es NIT); y si no hay nada, de opciones de relleno. Nada de esto se exporta.
- **`search_select` abre un buscador en un modal** en vez de un `<select>`: 425 actividades por 15 repeticiones serían miles de opciones montadas de entrada.
- Va detrás de un `React.lazy`: el simulador y sus datos de prueba no se descargan hasta abrirlo.

### Exportación

`src/lib/exportForm/` (`downloadFormExport`/`buildFormExport`) serializa todo a un único JSON descargable: `projectMeta`, `setupConfig.introModal` y `formSchema` (`gridBaseColumns`, `prelude` y `steps[]`), cada step con sus `rows[].fields[]` y sus `groups[]`.

Cada campo exporta `fieldId`, `name`, `type`, `label`, `colStart`, `colSpan`, `styles`, `validations` y `logic` (el `script` y las `rules`), y cuando aplican `title`, `options`, `fileConfig`, `alwaysDisabled`, `enableWhen`, `visibleWhen`, `apiBinding`, `dataSource`, `labelFor`, `content`, `tooltip`, `rounding`, `formatted`, `allowsNegative`, `decimals`, `inlineOptions` y `maxLength`. Cada fila lleva `rowId`, `columns` y, si los tiene, `groupId` y `styles`; cada grupo, `min`, `max`, `arrayPath`, el schema Zod del arreglo y sus `checks` prendidos. El preludio del formulario viaja una sola vez en `formSchema.prelude`.

Detalles del contrato:

- Los ids de campo en condiciones, reglas y `labelFor` salen **resueltos a nombre**, así el consumidor no necesita el mapa de uuids.
- El `script` sale como `{source, compiled, reads}`: `compiled` es JS con `{campo}` ya sustituido, listo para `new Function`; `source` viaja solo para poder reeditarlo (ejecutarlo sería un error, porque `{campo}` no es JS); y `reads` son los campos que lee, para ordenar el cálculo sin volver a parsear.
- `validations.zodSchema` es **opcional**: los campos presentacionales lo omiten, y su ausencia es cómo el consumidor sabe que ahí no hay nada que validar. Las variantes condicionales llegan en `validations.zodSchemaWhen`.
- `styles` es un objeto CSS ya resuelto. En el campo viene siempre, aunque sea `{}`; en la fila, solo si tiene algo.
- `projectMeta.formId` y `projectMeta.version` todavía no identifican nada (ver gaps).

El archivo que baja **Exportar** lleva una clave más, `builderDraft`: la copia del proyecto, con la misma forma del borrador, para poder volver a abrirlo. El consumidor la ignora. `buildFormExport` no la incluye, así que el simulador y la vista JSON no la ven.

### Abrir un formulario exportado

El mismo JSON de **Exportar** sirve para seguir editando el formulario en otro computador o para pasárselo a otra persona. Se abre desde el asistente de inicio (**Cargar formulario**) o, ya dentro del builder, con **Abrir…** en el bloque Formulario del panel derecho, que pide confirmación porque reemplaza el formulario actual y no se puede deshacer.

- **Se reconstruye desde `builderDraft`, no desde lo compilado.** `formSchema` pierde información —las validaciones salen como texto Zod, los estilos fusionados y las comprobaciones apagadas no viajan—, así que al abrir se ignora y se vuelve a generar.
- **Pasa por el mismo camino que un borrador de `localStorage`**: migraciones, esquema de Zod (que también sanea los enlaces) y corrección de nombres repetidos (`parseDraft`, en `src/lib/persistence/`). Un archivo de una versión anterior del builder se actualiza solo.
- Antes de abrirlo se muestra qué trae: tipo, pasos, campos y fecha de exportación. Lo abierto se guarda en el acto como borrador, sin esperar el autoguardado.
- **Solo abre archivos exportados con `builderDraft`.** Uno anterior a este cambio no la trae y se pide volver a exportarlo; uno de una versión más nueva del builder se rechaza con su propio aviso.
- **Los bancos del simulador no viajan**: quien abre el archivo pega sus propios catálogos, fechas y UVT.
- **Abre solo archivos de personas de confianza**: sus scripts se ejecutan en tu navegador cuando usas el simulador.

Vive en `src/lib/projectFile/`, `useProjectImport`, `ProjectFilePicker` y `ProjectImportModal`.

## Gaps conocidos / no implementado

- El `script` se exporta compilado a JS y el consumidor lo ejecuta con `new Function`. **Esto define el límite de confianza del archivo**: cualquiera que le pueda entregar un JSON al consumidor obtiene ejecución de código en él. Es una decisión coordinada, no una restricción de API pública.
- **Un bucle infinito en un script congela la pestaña.** No hay defensa barata en el hilo principal; la salida real sería un Web Worker con timeout. Riesgo asumido: quien escribe el script es quien lo prueba.
- **Hay un solo borrador por navegador.** No caben dos formularios guardados a la vez, y un borrador que no valida al abrir la app se borra —con aviso— sin dejar copia. La salida es exportar: el JSON trae el proyecto completo y se puede volver a abrir (ver "Abrir un formulario exportado").
- **Los renglones 31 y 37 necesitan el modal de entrada**, porque leen `{periodo_anio}` de ahí, pero el asistente lo deja como opcional incluso para ICA. Sin modal, el campo sigue escribible pero no calcula, y no avisa.
- **El renglón 31 tiene escritos a mano dos ids del catálogo `tipos_sancion`**: `TIPO_SANCION_EXTEMPORANEIDAD = "1"` y `TIPO_SANCION_OTRA = "4"`, en `baseTemplate.constants.ts`. Si el catálogo cambia esos ids, la regla se rompe en silencio.
- **Mudar a otro paso un campo que estaba en un grupo repetible conserva su `apiBinding`**, contra la regla de que salir del grupo limpia el mapeo. Pasa igual arrastrándolo a un chip de paso que con "Mover a paso".
- **Tres campos con opciones todavía infieren su catálogo desde `apiBinding.path`**: `periodo_anio`, `clasificacion_contribuyente` y `tipo_representante`; los otros diez ya declaran `dataSource`. `juegos_permitidos` está en `CATALOGS` pero ningún campo lo usa, y los nombres de catálogo todavía hay que acordarlos con el otro proyecto. Sigue abierto: `FieldOption.id` es un uuid, así que una opción escrita a mano no tiene id de catálogo que enviar.
- Los **12 campos con opciones mapeados a hojas `number`** muestran una advertencia **`⚠ tipo`** permanente. El id de catálogo es numérico, pero `fieldMatchesSchemaType` no deja que un tipo con opciones case con `number`.
- **La tarifa de la actividad llega vacía, y ya no es por el mecanismo.** `dataSource.fills` está construido y el código CIIU se llena bien; lo que falta son los datos: la conversión del volcado se comió la columna `tarifaXMil` y las 425 actividades no la traen. Hasta que se regenere el catálogo o se peguen las tarifas en la pestaña **Catálogos**, `impuesto_actividad` sigue dando 0. Comprobado que con una tarifa cargada la cadena calcula. **No inventar tarifas para tapar el hueco.**
- **El mapeo solo conoce el contrato de ICA.** Hay un único `PAYLOAD_SCHEMA` (`DeclaracionIcaE`), así que un formulario de Retención o de Autorretención se mapea contra las hojas de ICA.
- **`projectMeta.formId` cambia en cada exportación** (`frm_` más la hora) **y `version` siempre es `"1.0.0"`**: el consumidor no puede saber si dos JSON son el mismo formulario ni cuál es más nuevo.
- Un campo del formulario no puede condicionar contra un campo del modal introductorio: la lista de candidatos sale solo de `formSteps`.
- `validations.pattern` no se valida donde se escribe. Ya no puede ejecutar nada, pero una expresión regular inválida hace fallar la construcción del schema del lado del consumidor.
- **Zod valida la forma del borrador, no su coherencia**: un `colSpan` negativo, un `dataSource` en un campo de texto o un `labelFor` que apunta a un campo que ya no existe pasan igual.
- Con varios campos seleccionados no se pueden **arrastrar juntos dentro del lienzo** ni **editar propiedades en lote**, y el marco de selección no desplaza el lienzo al llegar al borde.
- ~~El simulador no aplica `styles`~~ **Resuelto.** El simulador ahora pinta `field.styles`, `row.styles` y `tooltip.styles` tal como llegan del export.
- ~~`styles.customClasses` funciona solo por casualidad~~ **Resuelto.** Los estilos ya no viajan como clases de Tailwind: `customCss` guarda CSS de verdad (`"font-weight: 700; text-align: right;"`), y el export entrega un objeto `style` plano — el consumidor no necesita tener esas clases en su propio código fuente. Ver "Estilos" y, en `CLAUDE.md`, la sección "Styles are plain CSS, not Tailwind classes".
- ~~Renglón 35 (`valor_a_pagar`) no tiene cálculo~~ **Resuelto.** El 35 es el 33 (`return {total_saldo_a_cargo};`): con saldo a favor el 33 ya da 0 y no queda nada que pagar. El 38 es `max(35 − 36 + 37 − 34, 0)`; restar el 34 evita que los intereses se cobren sobre una deuda que no existe. Algunos municipios piden ver el saldo a favor como un 35 negativo; esa variante no está hecha.

---

`CLAUDE.md` documenta las decisiones de diseño y las razones detrás de ellas, con más profundidad que este archivo. `docs/Project.md` (en español) es la especificación de producto original — sigue siendo la referencia para la forma del JSON destino y cualquier detalle no implementado.
