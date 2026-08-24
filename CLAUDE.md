# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

The core builder described below is implemented, including the eight-step Industria y Comercio template, repeatable groups, the script/rules engine, the presentational field types and the **simulator** — a working prototype of the consuming app that runs the exported JSON. `docs/Project.md` (in Spanish) is the original product spec — still the reference for the target JSON schema shape and any unimplemented details; check it before adding features so structure matches the intended data model.

Not yet implemented / known gaps:
- No test runner configured, and none will be added: the user considers the project too volatile to justify tests right now. Verification is done with throwaway `pnpm exec tsx` scripts in the scratchpad.
- `logic.script` is exported **compiled to JS**, and the consumer runs it with `new Function`. **This defines the trust boundary of the file**: anyone who can hand the consumer a JSON gets code execution in it. The user builds the consumer too, so this is a coordinated decision — not a public API constraint. See "The field script".
- `persistence.ts` versions the draft (`DRAFT_SCHEMA_VERSION`) and migrates it before validating, so a shape change no longer costs the saved work. `loadDraft` returns a `DraftLoad` — `empty | invalid | ok` — so a draft that still fails Zod after migrating is **discarded, deleted from `localStorage` by `useDraftRecovery`, and reported** in the setup wizard. Zod validates *shape*, not coherence: `colSpan: -999`, a `dataSource` on a `text` field or a dangling `labelFor` all still pass.
- `validations.pattern` is not validated where it is authored. Since the injection fix it can no longer execute anything, but an invalid regex now throws `SyntaxError` in the consumer when it builds the schema. A `try { new RegExp(value) } catch` in `ValidationsPanel` would catch it where it is written.
- **Renglón 31 is the only place a literal catalog id is written by hand — now twice.** `TIPO_SANCION_OTRA = "4"` in `baseTemplate.constants.ts` drives the `visibleWhen` that reveals `descripcion_sancion`, and `TIPO_SANCION_EXTEMPORANEIDAD = "1"` is interpolated into the sanción script, where it decides whether the field auto-liquidates at all. `ConditionValueInput` offers a dropdown only when the observed field has *local* options, so a catalog-fed field degrades to free text and the author must know the id; inside a script there is no picker at all. The fix — read the loaded **catalog bank** (never `lib/mockCatalog`, which is behind the lazy boundary and would drag ~93 kB into the initial chunk) — was scoped and deferred by the user. Until then, reordering `tipos_sancion` breaks that condition in silence.
- **Two catalog-fed selects still sit on the path-inference fallback:** `periodo_anio` and `clasificacion_contribuyente` (plus the `tipo_representante` toggle). `CATALOGS` declares nine names — `departamentos`, `municipios`, `tipos_documento`, `tipos_persona`, `periodos_anuales`, `tipos_declaracion`, `tipos_sancion`, `juegos_permitidos`, `actividades` — and the template wires `dataSource` on eight fields. **The catalog ids are contract names the consumer translates to endpoints and have not been agreed with them yet**; renaming one later is a one-line change here but a breaking change there. Three are declared with no field pointing at them: `tipos_persona` (the `contribuyente.idTipoPersona` leaf exists but the template never captures it — and note the endpoint is `ListaTipoPersonaNoConvencional`, i.e. consorcio/patrimonio autónomo, **not** natural vs jurídica), `tipos_sancion` and `juegos_permitidos`. Related and still open: `FieldOption` carries `{id, label}` where `id` is a uuid, so a manually-authored option has no catalog id to send.
- **Renglones 31 and 37 cannot compute without the intro modal.** Both read `{periodo_anio}`, which lives in `introModal.steps`, and the setup wizard makes the intro modal optional even for `industria_comercio`. Without it the name resolves to nothing, `scanScript` leaves `{periodo_anio}` as bare JS and the script throws `periodo_anio is not defined`. **The failure is contained and honest** — the issue is listed against that field and the field stays typeable, which is how both renglones behaved before they had scripts — but the two most valuable calculations in the form are silently unavailable. The real fix is either to stop offering "no intro modal" for this form type or to move the año gravable into a form step.
- Selects mapped to `number` leaves show a permanent **`⚠ tipo`** warning (`periodoAnio`, `idPeriodoAnual`, `idTipoDeclaracion`, `tipo_documento`, `municipio`, `clasificacion_contribuyente`, the `search_select` for actividad). A two-line fix in `fieldMatchesSchemaType` — letting option-based types match `number` — has been offered and not yet approved.

## The right panel (`RightSidebar`)

Everything that used to sit above the canvas — the header (title, badge, Guardar, the view-mode
tabs, the zoom control, Simulador, Exportar JSON), `CanvasTabs`, `TransferNotice` and
`StepTitleEditor` — lives in a right-hand panel, mirroring the left one. The canvas now owns the
full height of the window, which is the groundwork for making it a real pan/zoom surface.

`AppLayout` takes three slots (`sidebar`, `canvas`, `rightSidebar`) and `FormBuilder` fills them.
The panel is `organisms/RightSidebar/`, grouped into two `PanelSection` cards — **Proyecto**
(tipo de formulario, vista, zoom, Guardar, Simulador, Exportar JSON) and **Steps** (las pestañas de
paso más el título/subtítulo del paso activo) — the same molecule the left sidebar's panels use for
their own sections. `atoms/SidebarSection/` (a bare rótulo with no card, the panel's original
section wrapper) was deleted once `PanelSection` replaced its one caller: the two conventions were
never meant to coexist, and keeping an unused component around is the kind of leftover nobody later
knows whether they can touch.

Settled decisions:

- **It is the left sidebar's construction mirrored, not a new one.** An `<aside>` that shrinks
  `w-80 → w-10` with `overflow-hidden` over a child pinned at `w-80`. The clipping keeps whatever
  is closest to the *inner* edge, so the collapse strip sits on the left of the panel — facing the
  canvas — where the left sidebar's icon rail sits on its own outer edge for the same reason.
- **The panel does not scroll, period — not even with dozens of steps — and that is what let the
  step tabs move to second place.** The tabs used to go first specifically because "a scrolled
  panel would put the drop target out of reach." That was a consequence of the panel scrolling, not
  a rule about order: once the panel structurally cannot scroll, the reason is gone. The no-scroll
  guarantee comes from `min-h-0` on the flex child wrapping the two sections (without it a flex
  item cannot shrink below its content's height, and the overflow escapes the panel instead of
  being clipped where it is supposed to be) plus a `max-h-56 overflow-y-auto` scoped to just the
  step-chip grid inside `CanvasTabs` — the one deliberate exception, and the only place in the whole
  panel that can still scroll. The two are inseparable: reordering the sections without also making
  the panel unable to scroll would silently reintroduce the exact bug the original ordering existed
  to prevent.
- **A step tab collapses to its bare number; only the active one expands with its title and the
  delete ✕.** This is what makes the no-scroll guarantee hold at any step count: a 28 px chip with a
  6 px gap packs six per row inside the panel's ~222 px of usable width, so even 36 steps fit in the
  chip grid's `max-h-56` before its own internal scrollbar has to appear — measured against the
  full-title chip this replaced, which fit one or two per row and had no ceiling at all. The
  trade-off is real and accepted: mid-drag you aim at a numbered square, not a name. Three things
  soften it — the active chip stays expanded and, since the active step cannot change mid-gesture,
  it never moves during a drag; every collapsed chip still carries the full title as a native
  `title` tooltip; and the title/subtitle editor sits right below the grid, always naming the step
  you are on. The delete button only lives on the active chip for the same space reason, which also
  makes deleting a step you are not looking at one click harder — accepted as a feature, not a
  papercut.
- **`StepTabChip`'s `useDroppable` — id and data — did not change.** The chip's *content* is what
  collapses; the drop target underneath, `` `tab-${type}-${stepId}` `` with `{canvasTarget}`, is
  identical in both the expanded and the collapsed rendering, so `useDragAndDrop` needed no changes
  to keep resolving field- and row-transfers onto a tab.
- **This made cross-step dragging better, not worse.** The tabs used to scroll away with the canvas,
  so on a long form there was no tab to aim at from the bottom. A fixed side panel always has them.
- **With the panel collapsed there is no cross-step drop target**, which is accepted. Auto-opening
  the panel when a transfer drag starts was considered and rejected: it would reflow the canvas
  under a moving pointer, mid-gesture.
- **`canvasViewMode` moved to the store.** It was `useState` in `Canvas` when the tabs and the
  canvas were the same component; now the writer (the panel) and the reader (the canvas) are
  different subtrees. `CanvasViewMode` moved to `types/ui.ts` and `VIEW_MODE_TABS` to
  `constants/canvasView.ts` for the same reason — the co-location rule. `Canvas.types.ts` and
  `Canvas.constants.ts` were deleted once empty.
- **Neither `isRightSidebarOpen` nor `canvasViewMode` is persisted**, matching `isSidebarOpen` and
  `canvasZoom`. No draft schema line, no `DRAFT_SCHEMA_VERSION` bump.
- **The right panel has no icon rail.** Its content is two sections about one document, not eight
  alternative panels; a second rail would cost 56 px and add a navigation decision for content that
  already fits with no scroll.
- **`FORM_TYPES` (and its `FormTypeOption` type) moved out of `SetupWizardModal/` and into
  `constants/formType.ts` / `types/setup.ts`.** It was private to that folder until the Proyecto
  section needed the form type's display label for its badge; the co-location rule says a
  declaration used from outside its folder stops being private the moment a second caller needs it.
- **`SaveButton`'s timestamp moved from beside the button to below it.** It used to sit to the
  button's left and only while `justSaved` was false, so the button's own x-position shifted every
  time the timestamp appeared or disappeared — a jump that is far more noticeable in a ~222 px-wide
  card than it was in the old full-width header. The button is now always the first, full-width
  element in a `flex-col`; the timestamp is a second line that can come and go without moving
  anything above it.

## Zone placement (Shift / Shift+Ctrl while dragging)

Holding **Shift** while dragging highlights every column of the target row (`RowZoneOverlay`) so you pick the exact start column; the field keeps its width. **Shift+Ctrl** anchors the start at the column where Ctrl was pressed and lets the pointer set the end, so the width follows the selection. Modifiers are read live mid-drag and apply to new fields dropped from the palette too, not only to fields already on the canvas.

`CanvasField.colStart` holds the position (1-based, matching CSS grid line numbers) and **ships in the exported JSON**, so the consumer has to read it or layouts will not survive the round trip. The rules live in `src/lib/rowLayout/` as pure functions (`getFreeRuns`, `findNearestFit`, `resolvePlacement`, `getMaxSpanAt`, `repackRow`, `migrateRows`); keep that file free of React and store imports so it stays verifiable on its own. `loadDraft` migrates pre-`colStart` drafts by turning each overflowing visual line into a real row.

Settled decisions — do not re-litigate them without asking:

- **`dragPlacement` is written only when it actually changes.** `recomputePlacement` runs on every `pointermove` — ~100/s — and almost always recomputes the same thing, but a store write creates a new state object and forces every subscriber to re-run its selector. `applyPlacement` compares by value first (`samePlacement`, since the recomputed object is always a fresh instance). Measured: a 120-move drag across 6 columns went from 120 writes to 6. The refs in this hook exist for the same reason; the write was the one that slipped through.
- **Collision is resolved by magnetic snap, never by pushing.** If the target range overlaps a neighbour, the preview slides to the nearest valid gap; if nothing fits, it goes red and the drop is rejected. A field the user is not dragging is never moved.
- **Holes are preserved.** Deleting or moving a field leaves its gap; every position is explicit. The one exception is `updateRowColumns`, which re-packs, since resizing a row is a deliberate layout change.
- **One row is one visual line — rows do not overflow to a second line.** A full row rejects a dropped field instead of wrapping. The user **deliberately kept the restriction** after testing it — the intended workflow is to add another `CanvasRow` and place the field there. It is a guardrail, not a bug. Implementing real multi-line rows would require a line index in the model and would turn every placement rule two-dimensional; the cheap alternative (auto-creating a row below on overflow) was offered and declined. Only revisit if the user explicitly asks.

## Canvas zoom (`canvasZoom`)

The canvas body scales with `transform: scale()`, 50 %–150 %, driven from a `−  100 %  +` control in
the canvas header, Ctrl/Cmd + wheel, and Ctrl/Cmd `+` / `-` / `0`. The point is a long form: eight
steps of renglones do not fit on a screen and the only way to see the shape of one was to scroll.
`src/lib/canvasZoom/` holds the arithmetic, `src/hooks/useCanvasZoom/` the DOM side.

**Only the canvas body scales.** The header, `CanvasTabs`, `TransferNotice` and `StepTitleEditor`
stay at 1× — they live in `RightSidebar` now (see "The right panel"), not above the canvas, so
there is nothing of theirs left inside the scaled wrapper to begin with. The tabs especially: they
are drop targets for moving a field or a row to another step, and shrinking them would make the one
gesture that is already hard to aim at harder. `FieldContextMenu` is also left outside the wrapper,
and that is what keeps its `clientX/clientY` positioning correct at any zoom.

Settled decisions:

- **dnd-kit never applies a `transform` inside the scaled container, and that is the only reason
  this was cheap.** `CanvasFieldChip` and `CanvasRow` both destructure
  `{listeners, attributes, setNodeRef, isDragging}` from `useDraggable` and take no `transform`; the
  dragged row goes `opacity-0` and every pixel of movement is drawn by the `DragOverlay`, mounted in
  `FormBuilder` as a **sibling** of `<AppLayout>`, outside the scale. Take `transform` from
  `useDraggable` in either component, or move the overlay inside the wrapper, and the classic
  dnd-kit-in-a-scaled-container bug appears: the element travels `k` times too far.
- **Collision detection needed no changes.** `pointerWithin` / `rectIntersection` compare pointer
  coordinates against `getBoundingClientRect()`, both in visual space, so the ratio is
  scale-invariant. Same for `getDropEdgeAtPointer`. Do not "fix" them.
- **The scale is read from the DOM, not from the store.** `getCanvasScale(el) = rect.width /
  el.offsetWidth` — `offsetWidth` is the layout width and transforms do not touch it, so the ratio
  is the accumulated scale of every ancestor. Chosen over threading the store value into
  `getColumnAtPointer` and `useFieldResize` because it returns **exactly 1** with no zoom, leaving
  today's path byte-identical, and because drag math that depends on a value someone has to remember
  to pass is one refactor away from being silently wrong. Two harmless limits: `offsetWidth` is an
  integer so the scale carries ~0,05 % error (a column is ~50 px), and a rotated ancestor would
  break it, since `getBoundingClientRect` returns the axis-aligned box — nothing on the canvas
  rotates.
- **What actually broke was mixing visual pixels with layout pixels**, in exactly three places, and
  the fix is five divisions. `getColumnAtPointer` and `useFieldResize` subtract `getComputedStyle`
  padding (layout) from a `getBoundingClientRect` width (visual) and divide by `GRID_GAP_PX`
  (layout); both now convert back to layout space first.
- **`measureRow` returns layout pixels and `RowDragPreview` scales itself.** These two go together
  and splitting them breaks the gap that opens when reordering rows: `buildRowDisplacement` applies
  that height as `translateY` **inside** the scaled container, where pixels are layout pixels, while
  the preview is drawn **outside** it, where they are not. `transformOrigin: "top left"` is what
  makes the ghost land on the row it replaces, since a row drag uses the empty
  `ROW_OVERLAY_MODIFIERS`.
- **The label chip in the overlay stays at 1×, so `centerOverlayOnCursor` needed no changes.** It is
  a floating caption drawn over the unscaled tab strip, not a replica.
- **`marginBottom: contentHeight * (zoom - 1)` is not cosmetic.** A transform does not change
  layout: the box still measures `H` while it paints at `H × k`. Without the compensation, zooming
  out leaves `H × (1 − k)` px of dead scroll, and zooming in pushes the bottom of the form out of
  the scrollport **where it cannot be reached**. Measured with a `ResizeObserver` on `offsetHeight`,
  which excludes margins and ignores transforms, so there is no feedback loop.
- **At `zoom === 1` neither the transform nor the margin is emitted.** An identity `scale(1)` still
  creates a containing block and a stacking context; the 100 % case keeps exactly the DOM it had
  before this feature.
- **The wheel is continuous, the buttons and the shortcuts step by 10 %.** A trackpad pinch fires
  many small `deltaY`s and stepping on each would hit the limits before the fingers lift — which is
  how Figma behaves.
- **Zoom is view state: not persisted, not in the draft, not in the export.** So there is no
  `persistence.schema.ts` line, no `DRAFT_SCHEMA_VERSION` bump and no migration. It resets to 100 %
  on reload; persisting it under its own `localStorage` key the way the theme is would be one line
  if that ever matters.
- **One zoom for both canvases**, form steps and intro modal alike.
- **Zoom anchors on the middle of the viewport, not on the cursor.** Figma's cursor anchoring needs
  `transform-origin: top left` plus horizontal compensation; this is a centered document
  (`mx-auto max-w-5xl`) that never scrolls horizontally, so `top center` plus a vertical anchor gives
  the right feel for half the arithmetic. The offset is measured against the content's own rect
  rather than `scrollTop`, because the unscaled chrome above it must not be multiplied by the zoom
  ratio — and it is computed in the hook body rather than in an effect, because by the time an
  effect runs the rects have already changed.
- Known cosmetic limit: `min-h-[60vh]` and `min-h-[70vh]` live **inside** the scaled content and
  `vh` resolves against the viewport regardless of scale, so at 50 % the empty canvas's minimum
  height reads as 30vh. Left as is.

## Reordering rows (drag the row itself)

A whole `CanvasRow` can be dragged to another position in the same canvas. Before this, swapping two rows meant emptying the first into the second field by field and then the second into the first. Row order **is** the order of `step.rows[]` — nothing stores an index — so `persistence`, `exportForm` and the simulator needed **zero changes**; this is purely an editing affordance.

The rules live in `src/lib/rowOrder/rowOrder.ts` as pure functions (`resolveRowDrop`, `resolveBandDrop`, `reorderRows`), free of React and store imports, exactly like `rowLayout`. The store action is `moveRow(rowId, target)`, where `target` is a `RowDropTarget` `{rowId, edge, isValid}` (`src/types/placement.ts`) — the **resolved** destination, not the one the pointer is over, so the indicator draws where the row will actually land.

Settled decisions:

- **Dragging a row never moves it into or out of a repeatable group.** Taking a row out would have to clear the `apiBinding` of every field in it — `actividades[].idActividad` means nothing outside the array — and doing that silently, mid-gesture, destroys mappings nobody asked to touch. Joining/leaving a group stays a separate explicit action. Reordering *within* a group works normally.
- **The two escape hatches are the ones `rowLayout` already uses**: a loose row dropped over a band snaps magnetically to the band's nearest edge (decided by which half of the band the pointer is in, not by the row underneath, since the real destination is the band boundary); a row that lives inside a group goes **red and is rejected** the moment it points outside it.
- **`rowDropTarget` is written only when it changes** (`sameRowDropTarget`), same reason as `dragPlacement` — `recompute` runs on every `pointermove`.
- **`recompute` bails out of column placement for row drags.** Without that cut, holding Shift mid-drag would compute a phantom field placement on the row below.
- **The band gets its own droppable, `disabled` unless a row drag is active** (`rowDrag` in the store, written twice per drag, not per move). A group's header — title, min/max, `arrayPath` select — is tall enough that without it the indicator vanishes right above the group, which is the most natural place to aim. `disabled` is what keeps it from competing with the inner rows for a *field* drop; that is structural, not a bet on dnd-kit preferring the smaller droppable.
- **The handle is a hover affordance on the row's left edge** (`atoms/RowDragHandle`), never the whole `<li>` — the row is already a droppable and its body is full of clickable chips. It uses **`group/row`, not a bare `group`**: the row is an ancestor of every chip, and an unnamed group there would reveal each field's own drag handle whenever the row is hovered.

### The gesture: you carry the section, the rest step aside

The first version dragged a small chip and drew a line where the row would land. The user rejected it: it has to feel like moving the whole section, with the other rows opening a gap for it.

- **The overlay is a replica of the row** (`molecules/RowDragPreview`), drawn at the row's real width — `rowDrag` (`{rowId, width, height}`) measures it once at `dragStart`, before anything moves. It is a deliberately simplified copy: no drag handle, no columns menu, no resize grip, since none of those work mid-flight. `centerOverlayOnCursor` is **dropped for row drags** (`ROW_OVERLAY_MODIFIERS` is empty) so the row keeps the point it was grabbed by; centring a full-width row on the cursor makes it feel like a chip again.
- **The dragged row goes `opacity-0`, not dimmed.** Its neighbours shift by exactly its height, so they land on top of where it sits; at 40% opacity you would see them overlap a ghost. Invisible-but-still-occupying-space is what makes the hole read as the hole.
- **`buildRowDisplacement` (`CanvasRowsGrid.utils.ts`) is the visual half of `rowOrder`** — same two cases, same group boundary. A loose row displaces whole **blocks** (a band moves as one unit); reordering inside a group displaces the band's **rows** individually. Getting this wrong shifts a band's contents out from under its own border.
- **The transition class is bound to the same state as the transform** (`rowDrag !== null`). On drop, `moveRow` and `resetDragState` batch into one commit, so `transition-property` is removed in the very same DOM mutation that resets the transform to 0 — the browser has nothing to animate. Bind them separately and every displaced row visibly slides back through the position it just legitimately took: the classic FLIP jump-back.
- **`dropAnimation={null}` for row drags.** dnd-kit's default flies the overlay back to the draggable's *initial* rect, which by then is the wrong place.
- **The valid drop indicator was removed; only the red one survives.** Once the gap opens, a line saying the same thing is noise. Red still earns its place: a rejected drop produces no displacement, so it is the only feedback there is.
- The bounce is `ease-[cubic-bezier(0.34,1.6,0.5,1)]`, an overshoot curve. It is written in a source file, so Tailwind v4 scans it — see "Styles are plain CSS, not Tailwind classes" for why `styles.customCss` deliberately does not go through the same path. Verified in the built CSS, where the minifier renders it `cubic-bezier(.34,1.6,.5,1)`.

## Row styles (`row.styles`)

A `CanvasRow` can carry its own `RowStyles` (`src/types/formStructure.ts`): `customCss`, `marginTop`, `marginBottom`. **Deliberately narrower than `FieldStyles`** — no `backgroundColor`, no `textColor`. Authored from `RowStylesMenu` (`organisms/RowStylesMenu/`), a popover anchored at the row's right edge, vertically centered — `RowColumnsMenu` keeps the top-left corner. Store action is `updateRowStyles(rowId, updates)`, merging onto `row.styles` the same way `updateFieldStyles` merges onto `field.styles`.

Settled decisions:

- **No colors, on purpose, for now.** A row is layout — the container several fields sit in — not something read like a field's own background. Coloring it opens the same contrast questions a field's own background already raises, one level up, over a bigger area. Add `backgroundColor`/`textColor` later as a deliberate, separate decision, not a copy-paste of `FieldStyles`.
- **`styles` is optional and starts absent**, the same shape as `groupId`: `createEmptyRow` does not set it, so an untouched row costs nothing and an old draft without the key still validates. This is why it needed **no `DRAFT_SCHEMA_VERSION` bump** — purely additive optional keys don't, per the persistence rule above — only its line in `persistence.schema.ts` (`rowStylesSchema`, structurally identical to the row-relevant third of `fieldStylesSchema`).
- **The export carries it resolved, the same way `field.styles` does**: `styles: resolveRowStyles(row.styles)` in `mapRows` (`exportForm.utils.ts`) — see "Styles are plain CSS, not Tailwind classes". A row with nothing to say resolves to `undefined` and serializes with no `styles` key at all, and `ExportedRow.styles` is optional for the same reason `ExportedField.styles` is not — a field's styles object always exists (`{}` at minimum), a row's does not.
- **Row styles reach the simulator too**, closing what used to be an open gap: `PreviewRowsGrid` spreads `row.styles` onto the same grid container that carries `gridTemplateColumns`, structural last.
- **`RowDragPreview` does not reflect `row.styles`.** The ghost overlay while dragging a row is deliberately generic (fixed orange border, no per-row look — see "Reordering rows") to signal "this is what's flying," not a faithful preview of the row's own appearance. Applying custom CSS there would fight that signal.

## Styles are plain CSS, not Tailwind classes

`FieldStyles.customCss`, `RowStyles.customCss` and `FieldTooltip.customCss` hold **CSS text the author types**, not Tailwind class names — `"font-weight: 700; text-align: right;"`, not `"font-bold text-right"`. This replaced `customClasses` because Tailwind v4 scans **source files** at build time: a class typed into the builder lived only in `localStorage` and in the exported JSON, never in the consumer's source, so it was emitted only if some component there already happened to use it. Measured against the built CSS before this change: `font-bold`, `text-right` and `uppercase` existed; `bg-purple-700`, `tracking-widest` and `text-2xl` did not. It failed **partially**, which is the worst mode — half the classes worked, so the bug read as something else.

`src/lib/cssStyles/` is the whole fix, free of React and store imports: `parseCssText` turns the author's text into a `CssStyleMap` (`Record<string, string>`, camelCase, ready for React's `style`); `resolveFieldStyles`/`resolveRowStyles`/`resolveTooltipStyles` merge the named properties (`marginTop`, `marginBottom`, `backgroundColor`, `textColor`→`color`) with the parsed `customCss` on top; `unsupportedDeclarations` runs each declaration through `CSS.supports()` for a non-blocking warning under the textarea, guarded for `typeof CSS === "undefined"` so a `tsx` verification script doesn't explode on a browser-only API.

Settled decisions:

- **The export carries one flat `CssStyleMap` per field and per row, not four named properties plus a class string.** `ExportedField.styles` and `ExportedRow.styles` are `CssStyleMap`; `ExportedTooltip.styles` too. `textColor` becomes `color` **only on the way out** — the model keeps `textColor` because the picker, the panel and existing call sites all name it that, and renaming it inside for no reason would be churn. The consumer does `<div style={field.styles}>` and interprets nothing.
- **The free text wins.** `{...namedProperties, ...parseCssText(customCss)}` — ordinary CSS cascade, last declaration wins, and it means the canvas paints the same result the consumer will. Type a color in the picker and also write `color: red` in the CSS box, and red wins.
- **No sanitizer.** The project's trust boundary is already `logic.script`, exported compiled and run with `new Function` — anyone who can hand the consumer a JSON already has code execution there. CSS assigned through React's `style` executes nothing; it just silently ignores whatever the browser doesn't understand. `unsupportedDeclarations` exists to surface that in the editor, not to block it — same non-blocking treatment as an unrecognized `{campo}` in a script.
- **Structural placement always wins over the author's CSS, and it is enforced by spread order, not by a property blocklist.** A field's `gridColumn` (position in the row) lives on a different DOM node than the one that receives `resolveFieldStyles`/`customCss`, so a stray `grid-column` in the author's text has nothing to land on. A row has only one node, so there the structural properties (`gridTemplateColumns`, the drag `transform`) are spread **after** the resolved styles in the `style` object, guaranteeing they win if the author's text names them.
- **The canvas renders the same function as the export, split to match its own DOM.** `CanvasFieldChip` destructures `marginTop`/`marginBottom` off `resolveFieldStyles(field.styles)` and applies them to the spacing wrapper (shared with the drag handle and resize grip, which are absolutely positioned against it), while the rest — background, text color, custom CSS — goes on the `<button>` that actually paints. Applying arbitrary custom CSS to the wrapper instead would be invisible: the button's own opaque background classes (`bg-white dark:bg-neutral-800`) would paint over it. `CanvasRow` and `TooltipBubble` have only one node each, so they apply the resolved map directly.
- **The simulator does not re-resolve anything.** `PreviewField`, `PreviewRowsGrid` and `PreviewTooltip` consume `ExportedField.styles` / `ExportedRow.styles` / `ExportedTooltip.styles` as already-resolved plain objects — that resolution happened once, at export time. This is also what makes the simulator a real test of the fix: before this change it ignored `field.styles` entirely (`grep .styles under components/organisms/preview/` returned nothing); now it renders the exact object the consumer would receive.
- **The migration (`DRAFT_SCHEMA_VERSION` 6) does not discard what it can't translate.** A small table (`TAILWIND_TO_CSS` in `persistence.migrations.ts`) covers the handful of classes someone actually types for a form field — weight, style, decoration, case, alignment, `display`. Whatever isn't in the table is kept as a CSS comment listing the original class names, exactly the way `preservedFormula` keeps a formula that didn't parse: nothing is silently lost, and the author sees what needs rewriting. Applies to `field.styles`, `field.tooltip` and `row.styles` — the last one needed its own draft walker (`mapDraftRows`/`mapStepRows`) since the existing `mapDraftFields` only reaches into `row.fields`, not `row.styles` itself.

## Moving things between steps (drop on a step tab)

A field or a whole row can be dragged onto another step's tab to move there. Before this the only route was the Almacén de Partes, which **copied** rather than moved: it minted a new id and a new `uniqueFieldName`, so moving a field meant recreating it under a temporary name, deleting the original and renaming back. **That was the Almacén's only real use, so once this existed it was removed** — store, panel, tab, draft key and all; see `DRAFT_SCHEMA_VERSION` 5.

**None of that was ever necessary.** `allFieldNames` (`formStore.utils.ts`) already spans both canvases, and `moveField`'s mutation already runs over `formSteps` *and* `introModal.steps`. A moved field keeps its `id` and its `name`, so no id-based reference breaks. The only thing missing was a way for the UI to name a row in a step it isn't drawing.

`src/lib/fieldTransfer/fieldTransfer.ts` is the shared core — `canTransfer`, `transferGroup`, `planLanding`, `collectCrossingRefs` — and both store actions (`moveFieldToStep`, `moveRowToStep`) go through it. **That sharing is the point**: the next payload (a whole group, a multi-selection, copy-instead-of-move) adds a case, not a feature, because the rules are already written down once.

### The Almacén de Partes is gone — do not rebuild it

It stored a field as a reusable `SavedComponent` you could drop into any canvas. **Its real job was moving a field to another step**, and it did that badly: dropping minted a new id and a new `uniqueFieldName`, so the "move" was a copy you then had to clean up by hand. Dragging onto a step tab does the same job properly — same id, same name, references intact — so the feature was removed rather than left as a second, worse way to do one thing.

What went with it: `savedComponents` and its three store actions, `SavedComponent`, `panels/LibraryPanel`, `molecules/SaveFieldForm`, `molecules/SavedComponentListItem`, the `library` sidebar tab and `SidebarTab` member, the `library` variant of `ActiveDrag` and its three branches in `useDragAndDrop`, and the "Guardar en el Almacén" block in `FieldContextMenu`. `allowsManualOptions`, `exportableOptions`, `hasTooltip` and `exportableTooltip` took `CanvasField | SavedComponent` and now take just `CanvasField`.

**The draft needed a real migration, not just a schema edit.** `savedComponents` was a declared key of `draftPayloadSchema`, so `DRAFT_SCHEMA_VERSION` went to **5** with a step that *deletes* the key. Dropping it from the schema alone would have validated fine — `z.object` strips what it doesn't declare — while leaving every saved component sitting in `localStorage` forever, invisible and unreadable. Note the migration helper `mapDraftFields` still walks `savedComponents` if the draft has one: steps 2 and 3 run *before* step 4 removes it, and a half-migrated component could break the step that follows.

If a genuine reuse need appears later ("this field again, in three forms"), it is a different feature from moving — it would be a template library shared across forms, closer to the catalog bank than to what this was.

Settled decisions:

- **A linked `label` travels with its field, in both directions.** Grab the input or grab the label, the pair moves; otherwise `labelFor` would point at another screen. The label is ordered first so it lands to the left of its field.
- **A row belonging to a repeatable group cannot change step.** Same rule as reordering — dragging a row never takes it out of its group — and here it would by definition, since the group lives in the source step's `groups[]`. The tabs render **rejected** for it, in the same red as a refused reorder. Teaching one rule once is worth more than a second mechanism.
- **`planLanding` deliberately does not use `resolvePlacement`.** That function's last resort squeezes the field into the widest free run, *truncating its `colSpan`*. Dropping by hand that is right — you are looking at it. Landing in a step you cannot see it would silently narrow the field. So: it fits whole, or another row is tried, or a fresh row is created. The width belongs to the field, not to the hole it lands in.
- **A row lands appended at the end of the target step.** No placement search is needed — the fields already fit in it, it is the same row. Position is adjusted afterwards by dragging, which is what row reordering is for.
- **The target step is stripped before planting.** The linked label may already live in the destination; without this `planLanding` would duplicate it instead of moving it.
- **`activeCanvas` follows the move and the field stays selected.** Otherwise the thing you just moved simply vanishes and there is no way to tell whether it arrived.
- **Crossing references are reported, never pruned.** `collectCrossingRefs` covers the same six id-based sources `removeField` cleans, and `TransferNotice` shows them. They still evaluate at runtime — the intro modal is answered before the form, so the value is there — but `LogicPanel` builds its candidates from `formSteps` only, so they stop being editable from the panel. The data is fine; the picker is what is short. Script refs are excluded because they travel by *name*, which moves with the field.
- **The tab droppable is `disabled` unless a transfer is in flight**, driven by `rowDrag` / `draggingFieldId` (two writes per drag, not per move) — the same structural guard the group band uses, so tabs never compete for an ordinary field drop.
- **Collision detection is `pointerWithin` first, `rectIntersection` as fallback** (`pointerFirstCollision`), set on the `DndContext`. dnd-kit's default compares the *overlay's* rect against each droppable, and since the row overlay is as wide as the row, carrying it up to the tab strip **covered every tab at once**. For a fully covered tab the ratio reduces to `tabArea / overlayArea`, so the **widest covered tab won and the pointer was irrelevant** — you aimed at step 1 and landed in step 4. The rect fallback is kept because it forgives the gaps between rows, where the pointer is inside nothing. This also aligns row reordering with `getDropEdgeAtPointer`, which was already pointer-based.
- **Over a tab the row preview collapses to the compact chip** (`hoveredTransferTarget`, written only when it changes). Drawn full size it hides the entire tab strip, so you cannot see which tab is highlighted — which is the only thing worth looking at up there. The chip also switches back to `centerOverlayOnCursor`, since a small preview reads better stuck to the pointer than floating where the row's edge used to be.

## Repeatable groups (`actividades[]`)

A repeatable group is a **marker on the row**, not a nested container: `CanvasRow.groupId` points at a `RepeatableGroup` held in `FormStep.groups[]` (`src/types/formStructure.ts`). `IntroModalStep` has no `groups` — the intro modal cannot hold one.

This shape was chosen because `useDragAndDrop` resolves everything by `rowId` and never inspects row contents, so **drag & drop, `rowLayout`, resize and every placement rule keep working inside a group with no changes at all**. That satisfies the user's explicit requirement that the fields of an activity stay freely movable and reorderable. The cost is that contiguity is not structural — `normalizeGroupRows` has to pull a group's rows back together by hand after any mutation that could scatter them.

Helpers live in `src/lib/repeatableGroup/repeatableGroup.ts`: `createRepeatableGroup`, `clampGroupBounds`, `groupRows`, `groupFields`, `findGroupIdForRow`, `findGroupIdForField`, `findGroupById`, `normalizeGroupRows`, `pruneEmptyGroups`, `detachGroup`, `groupNamesInUse`. Bounds default to `DEFAULT_GROUP_MIN = 1` / `DEFAULT_GROUP_MAX = 15` (the ICA rule) and are clamped to `MIN_GROUP_ITEMS = 0`…`MAX_GROUP_ITEMS = 99`, since other form types need different limits.

Settled decisions:

- **A group's `arrayPath` is absolute** (`actividades[].idActividad`), not group-relative. One namespace means `resolveLeaf`, duplicate detection and the mapping tree need no special cases.
- **Moving a field out of a group clears its `apiBinding`.** `moveField` compares the source and target `groupId`; a path scoped to the array item is meaningless outside it. Changing a group's `arrayPath` via `updateGroup` clears its members' mapped bindings for the same reason.
- **Deleting a group's last row deletes the group** (`removeRow` wraps steps in `pruneEmptyGroups`). `removeGroup` does the opposite: it keeps the rows and only strips their `groupId`.

UI: `RepeatableGroupBand` (`organisms/`) draws the band with title, min/max, `arrayPath` select, "+ Fila", a dissolve button and the collapsed `panels/GroupChecksEditor`, wrapping a nested list of `CanvasRow`. `CanvasRowsGrid.utils.ts` turns the flat row list into blocks via `toCanvasBlocks`, and `CanvasAddGroupButton` creates one.

### `group.checks` — validation that spans the whole group

`GroupCheck` is `{id, label, enabled, script, message}` (`src/types/groupCheck.ts`), held on `RepeatableGroup.checks[]` and exported as `ExportedGroupCheck` with the script **compiled**, exactly like `logic.script`. It is evaluated **once per group in root scope** — not per repetition — and **truthy passes, falsy shows `message`**. The motivating rule is in the ICA template: the sum of `ingresos_gravados` across the activities must equal renglón 16 (`total_ingresos_gravables`), because declaring income that is not split across activities is how the tax is evaded.

**This is the first validation in the project that is not per-field.** `collectErrors` runs `safeParse` over one scalar at a time, and a group's `zodSchema` cannot see the root — so Zod could not express it at any price. Note the group's array schema is exported but **the runtime never consumes it**, so building on it would have meant building a consumer path that does not exist.

Settled decisions:

- **The owner is the group, not the field it compares against.** Two reasons, and the second is the binding one: the activities step contains no root field to hang an error on, and validation is per screen and **gates navigation**, so hanging it on renglón 16 — which lives one step earlier — would block the taxpayer before a single activity exists to correct.
- **A script, not a typed `{kind: "sumEquals", …}` rule.** The script language already expresses it exactly: from the root `{ingresos_gravados}` *is* the whole column and `sum` flattens it. That reuses `compileScript`, the `{campo}` scanner, the prelude, `reads` and the compile cache, and — decisive — the consumer already runs compiled scripts with `new Function`, so a check costs it no new machinery. A typed rule would have cost it an interpreter and grown a case per rule. The template ships the instance pre-written, so the author only flips a switch.
- **A broken check never blocks.** A script that throws *and* one that returns `undefined` are both reported as a `RuntimeIssue` and **pass**. They are the author's bug, not the taxpayer's, and failing closed would trap someone on a step with nothing they could fix.
- **`enabled: false` is not exported at all.** Same rule as `exportableTooltip`: the consumer never learns the check existed and has no third state to interpret. The builder keeps it, so flipping it back on loses nothing.
- **The scope is built from `snapshot.groups`, never from the root's array copy.** `resolveRuntime` puts the **first-pass** columns in the root and the definitive ones are the third-pass. For a typed column they agree; summing a *calculated* column from the stale copy would give a number that is not the one on screen.
- **Not an edge in `fieldGraph`.** A check observes fields but produces no value, so it cannot take part in a cycle — the same reasoning already recorded for `validations.overrides`.
- **The error key is `check:${groupId}:${checkId}`** (`checkKey`, next to `fieldKey` in `runtimeValidation.utils.ts` so nobody edits one without seeing the other). It shares the map with field errors, whose keys are a bare name or `groupId:index:name`; a field called `check` yields the key `check`, never `check:a:b`.
- **`stepErrorKeys` adds the check keys of the step's groups.** Without that the error would be listed but "Siguiente" would advance anyway, which is the opposite of what it is for.
- **`lib/groupCheck/` is declarative only and must stay that way.** `exportForm.utils` imports `enabledChecks` from it, and the exporter is builder-side: when the evaluation lived there too, exporting dragged `formRuntime.utils` and `scriptRuntime` into the initial chunk (measured: +12.5 kB initial, −2.5 kB simulator). `buildCheckScope` and `runGroupCheck` therefore live inside `runtimeValidation.ts`, already on the far side of the lazy boundary.
- **The template compares with `abs(a - b) < 1`, not `===`.** Both sides round to the thousand today so they would be exact, but the rule should not depend on that.
- **It ships enabled.** Balancing is the rule and letting it through is the exception for municipalities that would rather collect the fine; turning it off is a visible decision, while forgetting to turn it on would let evasion through in silence.

## The field script (`logic.script`, `formScript`, `logic.rules`)

**A field's value is computed in exactly one place: `logic.script`, JavaScript with `{campo}` to read other fields.** This replaced a self-contained arithmetic language (`lib/formula/`) plus a rules editor plus a `logic.typeScript` textarea that was exported and never executed — three mechanisms competing to answer one question. `docs/Project.md` asked for a code editor from the start; the formula language was the detour.

`src/lib/fieldScript/fieldScript.ts` is the compiler: `compileScript`, `validateFieldScript`, `validatePrelude`, `buildScriptFunction`, `composeScriptBody`, `preludeLineOffset`, `normalizeScriptResult`. Nothing here executes; it compiles and validates. **No function throws** — the error travels in the result, because the editor calls them on every keystroke.

The contract, identical for a field script and a rule effect:

- **`return` gives the field's value. `return undefined` means "leave what the user typed"** — the field is not marked `computed` and stays editable. That is what a field with rules and no base calculation used to do.
- In scope: `value` (the field's current value), `index` (the repetition inside a group), and the helpers in `src/constants/fieldScript.ts` — `num`, `sum`, `count`, `abs`, `min`, `max`, `round`, `floor`, `ceil`, `dvNit`. They are passed as **named parameters**, not inside a container object, so they are called bare and the editor can offer them as real identifiers.
- Inside a group, `{sibling}` is that row's scalar; from the root, `{column}` is the whole array. `sum` flattens arrays, so the old `sumOf(x)` is `sum({x})`.
- A non-finite result becomes `null` (`normalizeScriptResult`), preserving the old division-by-zero semantics.

**Only `{x}` where `x` is an actual field name is substituted.** That single rule is what lets the syntax coexist with JS destructuring: `const {a} = obj` is left alone. An unknown `{x}` is therefore a **warning, not an error** — there is no way to tell a typo from a destructuring, so the panel says "does not match any field, left as JavaScript" and does not block.

**`scanScript` (`fieldScript.utils.ts`) is a scanner, not a regex.** Blind substitution failed two silent ways: a `{campo}` inside a string broke the JS (`"falta {x}"` → `"falta __v["x"]"`) and one inside a comment invented a graph edge that could close a phantom cycle. It skips strings, comments and template text, but **does** substitute inside `${...}`, which is real code. Known limit, documented in place: regex literals are not detected — it would need full expression-context tracking, and breaking it requires a field named like a quantifier (`/a{n}/` with a field `n`).

`formScript` (the **prelude**) is form-wide: functions and constants every field script sees in scope. **It cannot read fields** — `{campo}` is invalid there, because outside a field, and especially inside a repeatable group, there is no single answer to what its value would be. It is **concatenated ahead of the body**, not run separately, so declarations are in scope with no ceremony and the compiled body cache absorbs the repetition. `validateFieldScript` checks the body alone first, so a broken prelude is reported as the form's problem instead of as an error in all forty fields.

`FieldRule` is `{id, label?, matchAll, when: RuleCondition[], effects: RuleEffect[]}`, where an effect is `{kind: "script", source}` or `{kind: "constant", value}`. **Rules survived the change on purpose** — they are a declarative structure (condition plus effect), not a second language, and their effect speaks the same script. They run **after** the field's script and overwrite in list order. Helpers in `src/lib/fieldRule/fieldRule.ts`; UI in `panels/FieldRulesEditor` driven by `src/hooks/useFieldRules/`.

`src/lib/fieldGraph/fieldGraph.ts` unifies **four** edge sources into one dependency graph: `visibleWhen`, `enableWhen`, `rules[].when[]`, and the `{campo}` refs of the field script and of the rule effects. It was seven until the script absorbed the formula, the hand-declared `logic.dependencies` and the `logic.typeScript` that never ran. Refs are field *names*, so `buildNameToIdIndex` normalizes them to ids. `topologicalOrder` returns `{order, unresolved, cycle}` and never throws; `wouldCreateCycle` backs the condition editors' guard rails.

Settled decisions:

- **A cycle in a script is warned about, never blocked.** The condition editors block with an `alert` because there you pick from a list and there is no intermediate state. A script is free text: refusing input mid-word fights the person typing. `FieldScriptEditor` shows the whole chain in red.
- **What the script sees is coerced by field type** (`coerceForScript`). Without it `{a} + {b}` over two numbers concatenates the strings the input produced — `"5" + "3"` is `"53"`. In a tax calculator that error does not fail, it lies. **The whole model is coerced, not just the keys present in `values`**: a field the user never touched has no key, and `undefined` in a subtraction becomes `NaN`, which killed the entire chain of renglones behind it. That is exactly how renglón 35 — the one with no calculation — left renglón 38 at `null`.
- **The compilation cache is module-level, keyed by the composed body** (prelude included), the same trick `hydrateFieldSchemas` uses with the schema text. `resolveRuntime` calls the calculation once per scope on every keystroke — ~31 times with 15 activities — so without the cache that many `new Function` per keypress. Compile errors are cached separately, since a broken script is precisely the one that would be recompiled on every keystroke while it is being written.
- **`evaluationOrder` is still not exported.** Measured against the ICA template it came out byte-identical to document order, and it silently appended cycle members to the end, so a consumer had no way to know the order was invalid. What the export *does* carry now is `script.reads` per field, which is the raw material for the order without hiding the cycle. Do not re-add `evaluationOrder` without also surfacing cycles.
- **`lib/formula/` is gone, but its parser survives inside `lib/scriptMigration/`** — without the evaluator, roughly half the original. It is no longer a language implementation; it is the only thing that can open a draft saved before this change. When no old drafts are left in the wild, delete the folder and with it the last trace of the format.
- **A formula that does not parse is preserved as a comment inside the script**, and the field falls back to `return undefined`. It is neither dropped nor allowed to take down the whole draft. The case is real, not defensive: the old formula editor stored whatever you typed even when it did not compile, so an autosave mid-word leaves exactly that. Note the trap it replaced: once the schema stopped declaring `formula`, `z.object` **strips** the unknown key, so leaving it in place lost the calculation in silence.

## Presentational fields (`label`, `rich_text`)

Fields split into two classes. **Input fields** collect a value; **presentational fields** only show content. The predicate is `isPresentationalField` in `src/lib/fieldKind/fieldKind.ts`, backed by `PRESENTATIONAL_FIELD_TYPES` — use it rather than comparing types inline, so the panels, the schema builder and the export can't drift apart.

A presentational field **keeps** its `colStart`/`colSpan`, its `styles` and its `visibleWhen` (hiding a legal notice along with the field it accompanies is legitimate). It **loses** validations, payload mapping, `enableWhen`, script and rules, and it never appears as a condition or script candidate — there is no value to observe. `LogicPanel` short-circuits to just the visibility editor for them, and `resolveScript` returns `undefined` for them on the way out.

### `label` — an external label bound to a field

The link lives **on the label**: `CanvasField.labelFor` points at the input field. One owner, so there are no two ends to keep in sync, and it mirrors how `enableWhen` points outward. The rule "a field with a linked label has no label of its own" is **derived, never stored** — `hasLinkedLabel(fields, id)` computes it.

Deriving it is O(n) per question, which is why **`CanvasRowsGrid` builds the index once and drills a `linkedLabels: Map` down through `CanvasRow` and `RepeatableGroupBand`** (`buildLinkedLabelIndex`, keyed by the *target* field's id). Each chip used to subscribe to `getActiveRows` and rebuild the whole field list to answer for itself — n chips × O(n), measured at 16.9× the necessary work on a 15-field step. The index keeps `findLabelFor`'s first-wins tie-break so a hand-edited draft with two labels on one target answers identically. `AttributesPanel` still calls `findLabelFor` directly: one field, one question, no loop.

Invariants the store maintains:

- **1:1** — `setFieldLabelFor` unlinks any other label already pointing at that target.
- **No dangling refs** — `removeField` clears `labelFor` alongside `enableWhen`/`visibleWhen`/rules. Deleting the target leaves the label alive but unlinked, matching the "holes are preserved" rule; it is not deleted for the user.
- **`labelTargetCandidates`** offers only free input fields, plus that label's current target so the selection does not drop out of the list.

The linked field **keeps `field.label` in the model** even though nothing renders it — `name` is derived from it, and `ConditionFieldSelect`, `ScriptInput`, `FieldContextMenu` and the sidebar all use it to name the field. Making it optional would touch eight call sites for no gain. The canvas shows the *linked label's* text in muted italics instead of a blank, so the preview still resembles what the taxpayer sees.

**A linked label inherits its field's visibility.** `buildScope` runs a second pass: a `label` whose `labelFor` target is hidden is hidden too. It has to be a second pass because the target may come later in the field list. The alternative — copying the field's `visibleWhen` onto its label — works exactly until someone edits one of the two, and then leaves an orphan caption pointing at a field that is not there. Derived, never stored, same as `hasLinkedLabel`. The `=== false` guard matters: a target outside this scope leaves the label alone rather than hiding it.

### `rich_text` — a formatted content block

Standalone; it is never bound to an input. Supports bold, italic, underline and links — no lists, no headings.

**Content is stored structured, never as an HTML string** (`RichTextContent` in `src/types/richText.ts`): `[{ type: "paragraph", children: [{ text, bold?, italic?, underline?, href? }] }]`. The consumer renders it with components and never needs `dangerouslySetInnerHTML`. An HTML blob would have turned the exported JSON into executable markup — the same class of problem as the `validations.pattern` injection. Do not "simplify" this to HTML.

**The serializer is the sanitizer.** `serializeRichText` (`src/lib/richText/`) walks the DOM with a whitelist: it honours `b/strong/i/em/u/ins/a/br`, drops the whole subtree of `script`/`style`/`iframe` and friends, and flattens every other tag to plain text. It also reads inline `font-weight`/`font-style`/`text-decoration`, because pasting from Word delivers formatting as styled spans and the whitelist alone would discard it. This is what makes pasting from anywhere both safe and useful.

**Link policy** — `safeHref` allows only `http:`, `https:` and `mailto:`, and prefixes `https://` when no scheme is given. It runs at three points: inserting in the editor, serializing, and **again when loading the draft**, since `localStorage` is editable from devtools. Keep all three.

The editor is a `contentEditable` with its own toolbar and no new dependency. It paints the model by creating nodes, never via `innerHTML`, and repaints **only on mount** — repainting on every change would send the caret to the end mid-typing, so the panel passes `key={field.id}` to remount on field change. The selection is saved before the URL input opens and restored on apply, since moving focus loses it. Three lint suppressions are annotated in place: a `textarea` cannot carry inline formatting, and the mount effect cannot depend on `value`.

## Simulador (`FormSimulator`) — el consumidor de mentira

Renders the form as the taxpayer would see it. It is not a mock: it is a working prototype of the consuming app, living inside the builder.

**It is a full-screen mode, not a canvas view.** `isSimulatorOpen` lives in the store (next to `isSidebarOpen`) and `FormBuilder` returns `<FormSimulator />` early when it is on, so the sidebar, the canvas and the whole `DndContext` unmount — the simulator gets the entire viewport with no builder chrome. The entry point is a button beside "Exportar JSON"; it is deliberately *not* one of the `VIEW_MODE_TABS`, because those swap the canvas body while this replaces the app. `useAutosave` and the keyboard shortcuts live in `App`, above `FormBuilder`, so they keep running while the simulator is open. The header carries its own dark-mode toggle, since the sidebar rail that normally owns it is gone.

**The single rule that makes it worth anything: it consumes `buildFormExport(...)` and never touches `useFormStore`.** `useFormPreview` is the only place the store is read, and it reads it solely to feed `buildFormExport`. If the simulator can't do something, the real consumer can't either — that is the point. Everything is keyed by field **name**, because the export already resolved ids to names.

Layers, all React-free and benchmarked at ~1 ms per keystroke for the full ICA form with 15 activities:

- `lib/formRuntime/` — `buildRuntimeModel(export)` flattens the export into name indexes; `resolveRuntime(model, state)` returns a `RuntimeSnapshot` with a `root` scope plus one scope per repetition of each group, plus `issues` for what failed while computing.
- `lib/runtimeCondition/` — **`evaluateCondition`**, the executor for the 13 operators. It did not exist before: the builder only ever *authored* conditions. Shared by visibility, enablement and rule matching.
- `lib/runtimeDerived/` — resolves `logic.script` and `logic.rules` in topological order over field names (`planDerivedFields`, fed by `script.reads`). Script first, then rules override in list order, then `applyRounding` if the field declares it — see "Rounding".
- `lib/scriptRuntime/` — the only place in the project that runs the author's code, with `new Function`, same as `zodHydrate` with the schemas. A script that throws is reported as that field's problem and does not take the form down; an infinite loop cannot be contained and freezes the tab — the only defence would be a worker with a timeout, and it is not worth it today.
- `lib/runtimePayload/` — walks `apiBinding.path` to assemble the real `DeclaracionIcaE` object, expanding `[]` to the repetition index.
- `lib/zodHydrate/` — `new Function("z", ...)` over `validations.zodSchema`.
- `lib/mockCatalog/` — the options a catalog-fed select offers, resolved in three tiers: `MOCK_CATALOGS` keyed by a declared `dataSource.catalog`, then `MOCK_BY_LEAF` keyed by the payload leaf the field is mapped to, then `placeholderOptions` as a last resort. **All of it is simulator-only and none of it is exported** — verified by grepping the built JSON for the fake labels. `MOCK_BY_LEAF` exists because the ICA template's conditions compare against **real catalog ids**: without a `tipo_documento` option whose id is literally `"2"`, persona jurídica was unreachable in the simulator, so `visibleWhen` on razón social and the whole `dvNit` rule could never fire. Fake data that doesn't match the real ids makes the simulator lie in the one direction that matters.
  - **`mockCatalog.data.ts` is generated, not authored.** Nine catalogs (1601 entries — 1119 ciudades, 425 actividades) transcribed verbatim from dumps of the real endpoints. The ids and labels are the API's, warts included — `CUNDINAMARCA` appears twice (ids 3 and 11, where 3 holds only BOGOTÁ), `V ALLE DEL CAUCA` ships with the split word, `CORECCIÓN` is misspelled in two catalogs, and every label is uppercase. **Do not tidy them**: the point is that a condition written against a real id or label works here exactly as it will in the consumer. Regenerate rather than hand-edit if a new dump arrives.
  - Departamentos/ciudades are keyed by the API's own `idDepartamento` (1–33) and `idCiudad` (1–1119), **not** DANE codes — the earlier hand-written subset used DANE and was replaced. `TIPO_DOCUMENTO_NIT = "2"` survives the swap because the real catalog also numbers NIT as 2; that was luck, not design, so re-check it against any future dump.
  - **The actividades dump has a different shape and one open question.** Each row is `{idDeclaracion, codigoCIIU, descripcion, tarifaXMil}` — no `{success, result}` wrapper. `idDeclaracion` (30492–55326) is taken as the option id and `codigoCIIU` (130–9609) goes in `code`, on the reasoning that the template carries a **separate** `codigo_actividad` field for the CIIU, so the two cannot be the same value; the payload leaf is `actividades[].idActividad` and **nobody has confirmed which of the two it wants**. Flipping it is one line in the generator. Note the catalog's own `idDeclaracion` key collides by name with the payload's `actividades[].idDeclaracion`, which is a `providedByHost` leaf and a different thing. The dump also turned out to be a **subset**: CIIU 210 (silvicultura) shows up in the consumer and is not in these 425 rows.
  - **`CatalogOption` is `{id, label, code?, tarifa?}`** (`src/types/catalog.ts`), and `CatalogEntry` is that plus `parentId?`. The two extra columns exist because the search modal draws them apart — the code as the row's heading, the tarifa as a badge — instead of cramming them into the label. **They never reach the export**: the consumer gets them from its own endpoint, which really does return all four columns. Only actividades carries them today.
  - **The `tarifa` column is empty and that is a real gap.** The first conversion dropped `tarifaXMil` and the dump is gone, so every activity ships without it and all 425 rows of the search modal read **"sin tarifa"**. Two ways back, neither of which invents anything: re-run the generator over a fresh dump, or paste it in the **Catálogos** tab naming `codigoCIIU` and `tarifaXMil`. Do not fabricate tariffs to fill the hole.
  - **Projecting the chosen activity onto its siblings is built** — see "`dataSource.fills`". `codigo_actividad` fills correctly from `codigoCIIU`; **`tarifa_x_mil` still comes up empty, and that is now purely a data problem**, not a mechanism one: the dump lost the `tarifaXMil` column, so `impuesto_actividad` still reads 0 until a fresh dump is generated or the tariffs are pasted into the **Catálogos** tab. Verified: with a tariff present, the chain computes (`42.000.000 × 7 / 1000 = 294.000`).
  - Still invented, because they never came in a dump: the `periodoAnio`, `idClasificacionMunicipio` and `idTipoRepresentante` entries in `MOCK_BY_LEAF`.
  - Cost: the data file adds ~93 kB raw. It no longer lands in the initial chunk — see the lazy boundary below.

Settled decisions:

- **Three passes in `resolveRuntime`, in this order:** groups with raw root values → root with the group columns exposed as arrays → groups again with the resolved root. Inside a group `{campo}` is that row's scalar, but from the root the same name has to be the **array** with the whole column, so the group's columns have to be flattened into the root scope first. Collapse this into one pass and the ICA totals silently read `0`.
- **A scope per repetition, not one bag.** A field inside an activity resolves siblings from its own row (`{...rootValues, ...item}`), so `impuesto_actividad` computes per activity instead of reading the last one.
- **`eval` is not a shortcut, it is the contract.** `ExportedField.validations` carries **only** Zod schemas as strings — `required`, `min`, `max` and `pattern` are not exported. The consumer has no other way to validate. `hydrateZodSchema` wraps it in try/catch and surfaces the failure as a `RuntimeIssue` instead of crashing, which is also what finally makes the `validations.pattern` gap visible where it is authored.
- **`hydrateFieldSchemas` keys its map by the schema *string*, not by field name.** A field with conditional validations has more than one schema and which applies depends on what the user has typed, so a name key cannot answer. Side benefit: two fields with an identical schema share one validator.
- **`required` is sniffed from the schema string** (`isRequiredBySchema`: no trailing `.optional()`), for the same reason. `checkbox` is excluded because `buildZodSchema` never appends `.optional()` to it.
- **Runtime issues are deduplicated** (`dedupeIssues`). A broken script inside a group fails once per repetition, and the same calculation goes through three passes: without it, one error would be listed 45 times over 15 activities.
- **Preview state is local to the component tree**, never in the Zustand store — answers are throwaway and switching to another view resets them. `reconcileState` re-pads group arrays when the canvas gains or loses a group so typing isn't lost mid-edit.
- **Hidden fields are neither rendered nor validated** (`PreviewField` returns `null`, `collectErrors` skips them), matching the documented precedence.
- **Validation is per step, and it gates navigation.** There is no "validate everything" button — the form is filled step by step, so "Siguiente" (and the intro modal's "Continuar") validates only that screen and refuses to advance while it has errors; the last step's button becomes "Enviar". `stepErrorKeys(step, snapshot)` builds the keys a screen owns, expanding a repeatable group's rows to one key per repetition so `validateRuntime`'s indexing lines up. Errors are revealed per key (`revealed`), not globally, so a field you have not reached yet never shows red. The results panel still lists every error live, which is the global view.
- **`react-hook-form` is still unused.** It was installed by the spec but the hard part here is the runtime, not the state layer, and a plain value bag makes scripts-writing-back and repeatable arrays far easier to get right. Swapping the state layer later means replacing `useFormPreview`, not the libs.
- **`number` and `calculated` render `preview/PreviewNumberInput/`**, the only stateful control in the tree — it owns the typed draft and the focus/blur cycle. See "Number formatting"; the short version is that it is `type="text"` because a number input cannot display `1.000`, and that it stores a `number` while showing a formatted string.
- **`search_select` is a modal, `select` stays a native dropdown** (`preview/PreviewSearchSelect/`). That split is the whole reason the type exists: 425 actividades × 15 repetitions were **6.375 `<option>` nodes mounted before anyone touched the form**, and a native dropdown has nowhere to put the code and the tarifa. The trigger is a button showing `code · label`; the modal filters over code *and* description, accent- and case-insensitively (`\p{M}` over NFD), and nothing is filtered while it is closed. Escape and "Cancelar" close it. The header uses `bg-brand` — this app's orange — not the consumer's green, so the modal does not clash with the rest of the simulator.
- **The modal cannot clear the selection.** It had a "Quitar" button; it was removed, and `choose` narrowed to `CatalogOption` so there is no way back to an empty value from in there. Changing activity is picking another one, and an activity that genuinely does not belong is removed by deleting its whole row — the field, its ingresos and its impuesto go together, which is what "quitar la actividad" actually means. Emptying just the select left a row that still validated its siblings and still summed into renglón 17. The first row has no delete button at all (`canRemove` against the group's `min: 1`): a company that exercises no activity does not exist, so there is nothing to declare.
- **A missing tarifa says so, and only where a tarifa was expected.** The badge had no else branch, so an option without one drew nothing — indistinguishable from a modal that forgot to show it, which is exactly how the gap was read. Now the row falls back to a muted **"sin tarifa"**. What makes that honest instead of noisy is `fillsColumn(field, "tarifa")` (`lib/catalogFill/`): the field's own `dataSource.fills` is the only declaration that the column means anything for this catalog, so a `search_select` over municipios stays silent. Once the tarifas are loaded, only the genuinely missing ones keep saying it.
- **The tarifa reads `4X1000`, never `4‰`.** The per-mille sign is read as a percent on screen and the two are three orders of magnitude apart. Same reason the template's field is labelled "Tarifa X1000".

**The simulator is behind a `React.lazy` boundary** in `FormBuilder`, with a `Suspense` fallback. Whoever only builds forms never downloads it. Measured on the ICA template: one 872 kB chunk became **762 kB initial + 117 kB on demand** (gzip 240 → 208).

What actually crossed the boundary is `mockCatalog.data.ts` and the `preview/` tree — **not Zod**. Verified by grepping the built chunks: the catalog labels appear only in `FormSimulator-*.js`, but `invalid_union` appears in both. Zod stays in the initial chunk because `persistence.schema.ts` and `catalogBank.schema.ts` import it eagerly — `loadDraft` and `loadCatalogBank` both run at startup. So the old note that lazy-loading "would claw back Zod" was wrong: getting Zod out needs `loadDraft` to become async and dynamic-import its schema, which ripples into `DraftRecoveryModal` and the store bootstrap. Not done.

Keep the boundary honest: any new eager import of `lib/mockCatalog/`, `lib/zodHydrate/` or `components/organisms/preview/` from the builder side silently pulls the chunk back into the initial load.

**There is a second lazy boundary, and it is bigger**: `ScriptInput` lazy-loads `ScriptEditor` (CodeMirror), a **457 kB / 155 kB gzip** chunk that only downloads when the Logic tab is opened. Adding it moved the initial chunk by 0.35 kB. The textarea it falls back to is the real control from before CodeMirror, not a spinner — so the panel works while the chunk is in flight.

## Tooltips (`field.tooltip`)

`FieldTooltip` is `{content: RichTextContent, position: "top"|"bottom"|"left"|"right", customCss?}`. Only eight types offer it — `TOOLTIP_CAPABLE_FIELD_TYPES` in `src/constants/fieldTypes.ts`: text, number, select, checkbox, calculated, file, toggle_group, radio_group. Use `supportsTooltip` / `hasTooltip` / `exportableTooltip` (`src/lib/fieldTooltip/`) rather than checking the type or the emptiness inline, so the panel, the canvas chip and the export can't drift apart. `AttributesPanel` renders `panels/FieldTooltipEditor` behind that predicate; the store action is `updateFieldTooltip(fieldId, updates | null)`, where `null` removes it and a partial merges onto `createEmptyTooltip()`.

Settled decisions:

- **The trigger is an ℹ icon, not the field.** Hover-on-the-field was considered and rejected: the taxpayer has no way to discover help that only appears on hover, there is no hover at all on a phone, and on a `toggle_group` the bubble would cover the options being clicked. There is no `trigger` flag — one behaviour, one code path in the consumer. The icon goes next to the **visible** label, which for a field with a linked `labelFor` is the label's text, not the field's.
- **The canvas preview is deliberately looser than the contract**: the chip shows the ℹ icon but reveals the bubble on hovering the whole field, because the bubble has to be a sibling of the chip's `<button>` to escape the label row's `overflow-x-hidden`, and because judging a position is easier without having to hit a 12px target. `group/tooltip` (not plain `group`) because the chip already uses `group` for the drag handle.
- **Content is `RichTextContent`, never a string.** The user asked for bold/italic/links, which are the formats actually requested by their stakeholders. Reusing `rich_text`'s shape means `RichTextEditor`, `RichTextView`, `serializeRichText`'s whitelist and `safeHref` all apply unchanged — including the third `safeHref` pass in `persistence.schema.ts` when a draft loads. Do not "simplify" it to HTML or to a plain string.
- **An empty tooltip is not exported.** `exportableTooltip` returns `undefined` when the type doesn't support it or the content is blank, so activating the checkbox and typing nothing leaves no trace in the JSON.
- **No per-option tooltips.** Considered and cut: a per-option tooltip is only authorable when the field owns its options, i.e. when it is *excluded* from the payload — and both `toggle_group`s in the ICA template are mapped, while `radio_group` is unused, so it would have had zero places to be used today. The design stays forward-compatible: adding `tooltip` to `FieldOption` later is purely additive, since options already travel through `exportableOptions` and `buildZodSchema` only reads `option.id`.

## Rounding (`field.rounding`)

A numeric field can declare that its value is **approximated to the nearest thousand**: `499 → 0`, `500 → 1000`, `1499 → 1000`. It is the rule every Colombian tax declaration applies to its renglones. `rounding?: boolean` on `CanvasField`, offered only for `number` and `calculated` (`supportsRounding`, backed by `NUMERIC_FIELD_TYPES`); the panel is `panels/NumberOptionsEditor` and the store action is `setFieldRounding(fieldId, boolean)`.

**It changes the value, not the presentation.** What is stored, what the other fields read and what travels in the payload is the rounded number. It is not a display format, and there is no separate "formatted" value anywhere.

Everything lives in `src/lib/fieldRounding/` — `roundToMultiple`, `applyRounding`, `supportsRounding`, `exportableRounding` — with no React and no store imports.

Settled decisions:

- **A boolean, not a multiple.** In every form the user has built, the rounding is either to the nearest thousand or absent; a configurable multiple would have been one more decision per field and an option nobody would use. `ROUNDING_MULTIPLE = 1000` is private to the lib and is the only place to change if that ever stops being true.
- **`Math.round` is wrong here and the naive version is a real bug.** It breaks ties toward +∞, so it is not symmetric with negatives: `1500 → 2000` but `−1500 → −1000`, and `−500 → −0`. Negatives are not hypothetical — renglón 34 is a saldo a favor and renglón 36 goes negative routinely. `roundToMultiple` rounds the magnitude and reapplies the sign, and adds `+ 0` to kill the `−0`, which `Object.is` distinguishes and which would otherwise reach the payload.
- **Two application points, because there are two ways a value is produced.** What the user types is rounded **on blur** (`PreviewFieldControl`) — rounding every keystroke would make the field impossible to type in. What a script or a rule produces is rounded **as it is computed**, in `runtimeDerived`, and there is no choice about it: a `calculated` field is `alwaysDisabled`, and a disabled input never fires blur.
- **In `runtimeDerived` the rounding goes before publishing the value**, i.e. before `scriptValues[name] = coerceForScript(...)`. The field below reads it from there in the same pass, so rounding afterwards would leave the chain of renglones with two truths — one on screen and another in the next calculation.
- **Only when something produced the value.** A `calculated` field whose script returned `undefined` still belongs to the user, and what the user writes is rounded by the blur. That is the same `touched` flag that decides whether the field counts as `computed`.
- **Empty is not zero.** `applyRounding` returns the value untouched when it is `undefined`, `null`, blank or unparseable. Without that guard, leaving a field nobody touched would stamp a `0` on it — which passes `required` and travels to the payload as a declared value.
- **The blur writes a `number` where the input had a `string`.** Preview state holds whatever the input produced; `coerceValue` and `coerceForScript` convert on the way to validation and scripts. Both accept either, so this is safe, but it does mean a rounded field's state value has a different type than an untouched one.
- **The ICA template turns it on for the step, not field by field.** `applyNumericDefaults` sets it on every numeric field except `FIELDS_WITHOUT_ROUNDING`, so a new renglón rounds by default — which is correct — and what is written by hand is the short, reviewable list of exceptions. There are **four**, and none of them is money: `tarifa_x_mil` (a 4-per-thousand rate rounds to 0, and with it every activity's tax), `dv` (a check digit, 0–9), `numero_establecimientos` (a count) and `generacion_energia_kw` (**renglón 18 — it is a numbered renglón, but it carries kilowatts of installed capacity, not pesos**; that one is a judgement call and the user was told so). Measured: 38 numeric fields, 34 round.
- **Rounding runs before validation.** A field with `min: 1` where the user types `499` rounds to `0` and *then* fails — correct, since the declared value is 0, but the error message talks about a number the user never typed.

## Number formatting (`field.formatted`)

A numeric field can declare that it is **shown with a dot thousands separator and a comma decimal** — `1000` reads `1.000`, `1.5` reads `1,5`. `formatted?: boolean` on `CanvasField`, same two types as `rounding`, same switch in `panels/NumberOptionsEditor`, store action `setFieldFormatted`. Everything lives in `src/lib/numberFormat/`.

**The one rule the whole feature rests on: the formatted text never leaves the input.** Preview state holds a real `number`; the `1.000` exists only on screen, only while the field is unfocused. This is not a style preference — it is why `coerceValue`, `coerceForScript`, `buildPayload`, the Zod schemas and `apiBinding` needed **zero changes**:

```js
runtimePayload.ts:18   setDeepValue(payload, path, snapshot.root.values[name])  // no parsing
constants/fieldScript.ts:18   Number.parseFloat("1.000")  // → 1
```

A `"1.000"` leaking into state would put the **string** in the payload and make every script read **1**. A silent three-orders-of-magnitude error in a tax declaration. Keep the boundary at the input.

Settled decisions:

- **`type="number"` cannot do this, so the control is `type="text"`.** Per the HTML spec a number input's value must be a valid floating-point number, where the dot is the *decimal* separator: `"1.000"` there means **one**, and `"1.000,5"` is invalid so the browser blanks the field. `inputMode="decimal"` keeps the phone's numeric keypad.
- **The typing filter is stricter than what it replaced.** `type="number"` accepted `1e5` (valid scientific notation) and, worse, returned `event.target.value === ""` for invalid content — the user saw text and the app saw nothing. `sanitizeNumericInput` whitelists digits, dot, comma and a leading minus. `parseFormattedNumber` re-checks the same shape rather than trusting the caller, so the guarantee is local to the function that turns text into a number.
- **`PreviewNumberInput` keeps the typed text in local state while focused.** Without that draft, typing `1,` re-renders from the store value (already `1`) and the comma vanishes under the user's fingers. The draft exists only between focus and blur; at rest the text is derived from the value, which is the single source of truth.
- **Formatting happens on blur, like rounding, and for a sharper reason:** inserting separators mid-typing moves the caret and makes the field unusable. On blur the order is **parse → round → store number → display formatted**.
- **A dot is always a thousands separator, never a decimal.** That is what makes `1.000` mean a thousand. Known trade-off: someone typing `1.5` with English habits gets `15`. It is genuinely ambiguous and the form's locale won.
- **An unformatted numeric field still displays with a comma decimal.** The parser is shared, so showing `1.5` and reading it back would give `15`. Only the grouping differs between formatted and unformatted.
- **Written by hand, not with `Intl.NumberFormat`.** It has to round-trip exactly with our parser, and `Intl` emits characters the parser does not expect — several locales use U+00A0 as the group separator.
- **Display decimals are capped at 4** (`MAX_DISPLAY_DECIMALS`), applied via `toFixed` before trimming zeros. Without it a script doing `0.1 + 0.2` paints `0,30000000000000004` on screen. Any real tarifa fits well within four.
- **All numeric fields go through the new control**, not just formatted ones — one behaviour to explain, and it also removed the string/number split in preview state: `PreviewNumberInput` always stores a `number` (or `""`).
- **The ICA template formats all 38 numeric fields**, including the four that do not round: a tarifa of `1,5` and a count of establishments both read better in the local convention. `applyNumericDefaults` sets the four numeric properties in one pass, each with its own scope — formatting takes no list, rounding names who is **out**, the sign names which calculated fields are **in**, and decimals take one default plus a per-field override map.

## Decimals (`field.decimals`)

How many decimals a numeric field **shows and lets you type**. `decimals?: number` — absent means "whatever it has, up to `MAX_DISPLAY_DECIMALS`"; `0` means integers only; `1` shows `4,0 / 7,5 / 6,0`. The picker offers 0–4 (`DECIMAL_CHOICES`) rather than a free input, same reasoning as the closed `CATALOGS` list.

**Padding is presentation; cutting is a value change**, and that split decides where each half lives:

- Showing `6` as `6,0` cannot lie — they are the same number. That is `formatNumber(value, decimals)` in `numberFormat`.
- Showing `1234,56` as `1.235` while storing `1234,56` *would* lie. So the cut happens in `applyDecimals` (`fieldRounding`), which changes the stored value, alongside `applyRounding`.

Settled decisions:

- **`roundToDecimals` scales instead of using `toFixed`.** Both are symmetric with negatives, so that property is not the tiebreaker. They differ in that `toFixed` follows the double's binary tail while scaling follows what gets printed: `0.35` is stored as `0.34999999999999997`, so `toFixed(1)` returns `0,3` — correct about the real value and an obvious error to anyone reading "0,35" on screen. Measured across 17 cases they disagree on three, and in all three the printed reading wins. Neither is exact and neither can be: `1.005` at two decimals gives `1` in both.
- **Above `MAX_SAFE_INTEGER` the scaled value is returned untouched.** The multiplication has already lost precision there, and rounding decimals on a number that does not have that many exact digits means nothing.
- **`decimals: 0` cuts the typed text *at* the comma, it does not just drop the comma.** Pasting `1234,56` has to give `1234`, not `123456` — the second is wrong by two orders of magnitude. Typing it character by character still ends at `15` for `1,5`, which is inherent to character filtering and the same thing that happens to a blocked minus.
- **The three value rules run in a fixed order — thousand, decimals, sign — in both places they are applied** (`PreviewNumberInput`'s blur and `runtimeDerived`). Between the first two the order does not matter, since a multiple of a thousand has no decimals left; it is pinned so nobody has to re-derive that.
- **Editing does not pad.** `toEditableText` still returns `6`, not `6,0`: padding is for reading, and the field is easier to edit without it. The round trip is what matters and it holds — `6` → `"6,0"` → `6`, never `60`.
- **The ICA template declares `0` everywhere and `1` on `tarifa_x_mil`** (`TEMPLATE_DECIMALS`, `DECIMALS_BY_FIELD`). The declaration carries no decimals in any renglón: money rounds to the thousand, the DV is one digit, establishments are counted and kilowatts arrive whole. The tarifa is the single exception, and it is a display-only win — the field is `alwaysDisabled` and filled from the catalog, so the typing rule never fires there.

## Negative values (`field.allowsNegative`)

A numeric field can declare that it **does not take negative values**. Two enforcement points, because there are two ways a negative appears: the user cannot type the minus sign, and a script's negative result is **clamped to 0**. `src/lib/fieldSign/` — `allowsNegative`, `clampNegative`, `exportableAllowsNegative`, `supportsSign`.

Like `rounding` and unlike `formatted`, **it changes the value**. Showing `0` while storing `−1.000.000` would leave the screen and the payload saying different things, and the field below would read the negative nobody sees.

Settled decisions:

- **The polarity is inverted relative to `rounding` and `formatted`, on purpose.** For those, absent means off. Here **absent means negatives ARE allowed**, and only `allowsNegative: false` restricts. If absence restricted, every already-saved draft and every field freshly dropped from the palette would start clamping silently, and a `−1.000.000` turned into `0` that nobody asked for is discovered late and badly. **The contract line for the consumer is exactly that sentence.** `setFieldAllowsNegative` therefore stores the `false` and deletes the `true` — the opposite of the other two actions.
- **`sanitizeNumericInput` takes a boolean, not the field.** It keeps `numberFormat` about text only; the sign policy belongs to `fieldSign`. With negatives off the minus is dropped like any other disallowed character, so it does not get in by pasting either.
- **`PreviewNumberInput` also clamps on blur**, even though the filter already makes a typed negative impossible. If the keyboard were the only barrier, any other route to the value would skip the rule and `min: 0` would only catch it at validation — with the value already feeding the renglones above.
- **In `runtimeDerived` the clamp goes after the rounding and before publishing**, same reason as the rounding itself: the field below reads from `scriptValues` in the same pass.
- **The clamp reports itself.** `clampNegative` returns `{value, clamped}`, `DerivedResult` and `RuntimeScope` carry a `clamped` map next to `computed`, and `PreviewField` shows "El cálculo dio negativo y se recortó a 0". A bare `0` where the author expected a negative reads as a broken calculation. **Simulator-only — it is not in the export.**
- **The ICA template turns it off on 27 of the 38 numeric fields**: all 25 `number` — 24 of them already declared `min: 0`, and `tarifa_x_mil` is never negative either — plus the **two** calculated in `CALCULATED_WITHOUT_NEGATIVE` that can actually go negative: renglones **10** (`nacionales − fuera_municipio`) and **16** (10 minus five deductions). The other eleven calculated are left alone: some are sums of non-negatives, and **33, 34 and 38 clamp themselves** with `max(…, 0)` — 35 inherits 33's clamp and 40 sums two non-negatives.
- **Clamping in the script and clamping with `allowsNegative` are not interchangeable, and 38 is why.** The flag *reports* itself ("El cálculo dio negativo y se recortó a 0"), which is right when a negative means the author's calculation is off. On renglón 38 a negative is the **normal** case — it is what a saldo a favor looks like — so the flag would fire a warning on an ordinary declaration. Where zero is the intended answer rather than a rescue, write the `max(…, 0)` in the script and keep the field out of the list.
- **The `min: 0` validations stay.** They are now unreachable for typed input but still cover whatever a script writes, and deleting them would change the exported contract for no gain.

## Length cap (`validations.maxLength`)

How much a field lets you write. Offered for four types — `LENGTH_CAPABLE_FIELD_TYPES`: `text`, `textarea`, `number`, `calculated` — and **counted differently in each half**: characters in the two text types, **digits of the integer part** in the two numeric ones. `src/lib/fieldLength/` holds `supportsMaxLength`, `countsDigits`, `effectiveMaxLength`, `maxLengthOf` and `exportableMaxLength`; the text-side cutting lives in `capIntegerDigits` (`numberFormat`).

**It is not a new property.** `validations.maxLength` already existed, was already authored in `ValidationsPanel`, already produced `z.string().max(n)` and was already in `persistence.schema.ts`. What was missing is that nothing stopped you typing past it, and that numeric fields ignored it entirely. So there is no `DRAFT_SCHEMA_VERSION` bump and no migration — only `ExportedField.maxLength` is new, and it is purely additive.

Settled decisions:

- **A number's cap counts digits, not characters of what is on screen.** The text of a number is not stable: the thousands dots come and go with `formatted`, the minus is `allowsNegative`'s business and the fractional part is `decimals`'. Counting characters, turning formatting on would eat into the cap and a field of 9 would start accepting 7. Counting integer digits, each property governs its own piece of the number and none of them collides.
- **It never changes the value.** Unlike `rounding` and the sign clamp, there is no blur step that cuts. Truncating a number already written moves it by an order of magnitude — exactly what a cap exists to prevent — so the keyboard stops the extra digit and the schema rejects whatever arrives by another route. A `calculated` field whose script overflows the cap therefore *fails validation*; it is not silently shortened.
- **It travels twice on purpose: inside the schema and as its own key.** The schema is the rule — it is the only thing the consumer can validate with. `ExportedField.maxLength` is what lets it also stop the typing before a value exists, which a schema string cannot do without being parsed. Both come from the same place in the model, so there are not two truths.
- **The exported key is the *base* rule, deliberately the loosest reading.** A conditional override can tighten `maxLength`, and the key always carries the base. That way the keyboard never refuses a keystroke that would be legal; what the override tightens is caught by `zodSchemaWhen`, which is what decides. (The override card offers length only for text-like fields, so a numeric digit override is not authorable today.)
- **`z.number()` cannot express it with `.max()`**, so it is a `.refine`: `999999999,99` has nine integer digits and would blow past any value cap written for nine digits. The generated expression is `Math.abs(Math.trunc(n)).toString().length <= n`, and `capIntegerDigits` implements the same reading on the text side.
- **A cap of zero is read as absent** (`effectiveMaxLength`), and both the schema and the input go through that one function. On a text field it would leave the control untouchable; on a number no value satisfies it, not even `0`. In practice it is what the panel holds for a moment while a number is being typed into it.
- **`capIntegerDigits` only trims when it actually cuts.** Building the prefix holds separators back until a digit follows, so a cut never leaves a dangling `1.234.` — but a `"1."` still under the cap is returned untouched, because eating that dot would take it out from under the fingers of someone typing a grouped number.
- **`select` lost the "Longitud" fieldset.** It was a dead control: an option-based field goes down the `z.enum` branch, where `minLength`/`maxLength` are never read. Its "Formato y mensaje" section is dead for the same reason and was left alone.
- **The ICA template declares no cap.** `numero_documento` expresses its 7–10 digits inside the `pattern`, which also has to hold the digits-only rule, and splitting that across two properties would put half the rule in each. Left as it is.

## Options and `apiBinding`

`select`, `search_select`, `toggle_group`, `radio_group` and `checkbox_group` (`OPTION_BASED_FIELD_TYPES` in `src/constants/fieldTypes.ts`) only get **manually authored options when the field is explicitly excluded from the payload *and* declares no `dataSource`**. Otherwise its options are injected at runtime by the consuming app. The predicates live in `src/lib/fieldOptions/fieldOptions.ts`; use `allowsManualOptions` rather than checking `apiBinding` inline, so the panel, the canvas preview, `buildZodSchema` and `buildFormExport` can't drift apart — it has exactly four call sites and they are the whole enforcement.

**Where a field's options come from — the precedence the consumer applies, in this order:**

1. `options[]` present → use them. Only ever emitted for excluded fields with no `dataSource`.
2. `dataSource` present → query `dataSource.catalog`; if it carries `dependsOn`, pass that field's current value as the parameter and offer nothing until it has one.
3. Neither, and `apiBinding.kind === "mapped"` → infer the catalog from `apiBinding.path`. Legacy fallback; most ICA selects still sit here.

**`options[]` and `dataSource` are mutually exclusive by construction**, not by convention: `allowsManualOptions` returns false whenever `dataSource` is set, which makes `exportableOptions` return `undefined` and `buildZodSchema` fall back to `z.string()` instead of freezing a `z.enum` of stale catalog values. The JSON can never carry both, so the consumer never has to break a tie.

Consequences to keep in mind:

- Dropping an option-based field from the palette creates it with **no options**. `FieldOptionsModal` (título + cantidad) fires from `ApiMappingPanel` at the moment the field is marked excluded, not on drop — **unless the field already declares a `dataSource`**, in which case excluding it asks nothing, because there is nothing to author.
- Leaving the excluded state **discards** `options` — this is deliberate, decided over keeping hidden data around. Declaring a `dataSource` discards them for the same reason (`updateFieldDataSource`); the two paths share `allowsManualOptions` so they cannot disagree.
- `buildZodSchema` only emits `z.enum([...])` for excluded fields; mapped ones fall back to `z.string()`, since the builder can't enumerate values it never sees.
- `ConditionValueInput` offers a dropdown only when the observed field has local options, so an `enableWhen`/`visibleWhen` pointing at a mapped select degrades to a free-text input where you type the catalog id by hand.
- `checkbox` and `checkbox_group` are **different types on purpose**. `checkbox` is a single boolean ("acepto los términos") — `z.boolean()`, only `isTruthy`/`isFalsy` operators, no "required" toggle. `checkbox_group` is multi-select: it carries `options[]` and its schema is `z.array(z.enum([...]))` (`MULTI_VALUE_FIELD_TYPES` drives the array wrapping). Do not merge them.
- `PAYLOAD_SCHEMA` currently has **75 leaves — 53 `number`, 22 `string`, no `boolean` and no arrays of scalars**; 3 are `providedByHost` and 5 sit inside `actividades[]`. So a `checkbox_group` has nowhere to map and will in practice always be excluded, and `fieldMatchesSchemaType` lets `checkbox` match `number` leaves (0/1) — otherwise every mapped checkbox showed a permanent, unavoidable type warning.
- `flattenLeaves` descends into arrays and stamps each item leaf with its `arrayPath`; `flattenSelectableLeaves(schema, arrayPath?)` filters by array context, so the mapping panel offers item paths only to fields that live in a group bound to that array.

### `field.inlineOptions` — options on one line

`inlineOptions?: boolean`, offered only for `radio_group` and `checkbox_group` (`INLINE_CAPABLE_FIELD_TYPES`; `toggle_group` is already horizontal and a `select` has nowhere to put them). Absent means stacked, as before, so no saved draft changes appearance. Predicates in `src/lib/fieldOptions/` — `supportsInlineOptions`, `showsOptionsInline`, `exportableInlineOptions` — and the switch lives in `AttributesPanel`'s **Diseño** section, not `FieldOptionsEditor`, because that panel only renders for fields that author their own options and a catalog-fed radio needs the layout switch just as much.

**It is presentation only**: it does not touch the value, the schema, or how many options can be chosen. A `radio_group` selects exactly one either way — it is not in `MULTI_VALUE_FIELD_TYPES`, so it holds a scalar, and the preview renders native radios. Inline uses `flex-wrap`, not `nowrap`: it is a layout preference, not a promise that four long options fit in five columns.

### `dataSource.fills` — columns of the chosen option copied into other fields

`CatalogFill` is `{column, field}` where `column` is `keyof CatalogOption` (`id | label | code | tarifa`) and `field` holds the target's **id** in the store, resolved to a **name** on the way out — exactly like `dependsOn` and `labelFor`. `src/lib/catalogFill/` holds `resolveFills` and `hasFills`; the panel is `panels/CatalogFillsEditor` inside the "Origen de opciones" section.

It exists because `codigo_actividad` and `tarifa_x_mil` are not typed: they display data from the chosen activity. The consumer already did this **hardcoded** (`ActividadRowForm` in `ica-frontend-Pruebas`); `fills` is the same thing declared in the JSON.

Settled decisions:

- **The declaration lives on the field that ORIGINATES the selection**, not on the ones being filled. One owner, no two ends to keep in sync — the same reasoning as `labelFor`.
- **The fill writes into the scope of the row it came from.** `useFormPreview.setValue` merges the resolved values into the same group item; without that, picking the activity in row 3 would fill row 1's tarifa. `resolveFills` itself is scope-agnostic — it returns a name→value map and the caller decides where it lands.
- **Clearing the selection clears the targets, and so does a column the catalog does not carry.** Leaving the previous activity's tarifa behind is worse than showing nothing: the tax would keep computing with it and the number would look right.
- **`catalogOptions` is only called when the field declares fills** (`hasFills` guard). Building the actividades option list is 425 entries and `setValue` runs on every keystroke of every field.
- **A fill whose target no longer exists is dropped whole**, both in `resolveDataSource` on export and in `pruneDataSourceReferencing` when the field is deleted — same rule as a validation override pointing at a deleted field. Deleting one target does not take the other fills or the catalog with it.
- **The columns come from `keyof CatalogOption`**, so adding a column to the catalog offers it in the picker with no second list to keep in step. `CATALOG_COLUMNS` only orders them for display.
- **`actividades[].idActividad` still carries `idDeclaracion`**, unchanged and unconfirmed — the user is checking with whoever wrote the API. Flipping it to `codigoCIIU` is one line in the catalog generator.

### `dataSource` — which catalog feeds a field

`FieldDataSource` is `{catalog, dependsOn?}` (`src/types/field.ts`). `catalog` is a contract string the consumer maps to its own endpoint; `dependsOn` names the field whose value parameterizes the query. In the store it holds the parent's **id**; `resolveDataSource` turns it into a **name** on the way out, exactly like `labelFor`.

`dataSource` answers "where do the options come from", and `apiBinding` answers "does this value travel in the payload". **They are orthogonal, and conflating them was the original bug.** `departamento` is the proof: it is `{kind:"excluded"}` because the API only wants `idCiudad` — the municipality already implies the department — and it carries `{catalog:"departamentos"}` because its options are still a catalog query. Before the split, marking a field excluded forced the author through `FieldOptionsModal`, so "excluded but catalog-fed" was unauthorable.

Settled decisions:

- **`CATALOGS` is a closed list** (`src/constants/catalog.ts`), picked from a dropdown, never typed. Same reasoning as `apiBinding.path` being chosen from `PAYLOAD_SCHEMA`: it is a contract shared with an app the builder cannot see, and a typo'd catalog name fails silently and with no clue on the far side. Adding one is a line there plus a line in `MOCK_CATALOGS`.
- **Identifying a catalog by field `name` was rejected.** It forces the consumer to carry a list of magic names, breaks the moment a field is renamed, and does not generalize to the next dependent pair. `dataSource` is that idea made explicit in the data.
- **A `dataSource` never ships its options.** The DANE departments and municipalities in `mockCatalog.constants.ts` are simulator-only; the export carries the catalog name and nothing else.
- **A catalog with no mock data still yields placeholder options** (`placeholderOptions`), so declaring one never leaves the simulator with a dead select you cannot fill past.

### The catalog bank — real options for the simulator

`CatalogBank` is `Record<catalogId, {source, entries}>` (`src/types/catalog.ts`), edited from the **Catálogos** sidebar tab and stored under its own `localStorage` key (`form-orchestrator-catalogs`), **never in the draft and never in the export** — `exportForm` and `persistence` contain zero references to it, so the isolation is structural rather than a promise.

It is keyed **by catalog, not by field**, and that is the whole point: `departamentos` is the same catalog in the ICA form and in retención, so loading it once serves every form. Per-field storage would have forced re-entering it per form, and that is what makes a "copy options from one simulator to another" button look necessary — it is a symptom of the wrong unit, and it does not exist here.

Settled decisions:

- **Options are pasted, not typed.** `parseCatalogPaste(raw, keys)` takes an endpoint response verbatim: it digs out the first array inside a `{data:[…]}`-style wrapper, and the author names the columns via `CatalogPasteKeys` (`{id, label, parent?, code?, tarifa?}` — an object because five positional params, four of them optional, are unreadable). Typing 1.100 municipios row by row is not a workflow anyone completes. `code` and `tarifa` are only read by the `search_select` modal; a tarifa that does not parse as a number is dropped rather than stored as `NaN`.
- **The bank wins whole, or not at all.** If a catalog is active (`usesCustomCatalog`), it is used even when the parent filter yields nothing. Falling back to mock data for an unloaded parent would mix real and fake options in one dropdown.
- **Which data to use is a per-catalog switch, not a prompt.** Each catalog is `default` or `custom`, and flipping to `default` **keeps** the pasted entries rather than discarding them — testing against the small fake set should not cost you the JSON you pasted. A modal asking "default or custom?" on entering the simulator was proposed and rejected: it would be a global answer to a per-catalog question, annoying if it fired every time and an unfindable hidden preference if it fired once. State you can see and flip beats a question you answer and forget.
- **`isSimulatedCatalog` takes the bank**, because the warning has to be true: before this it kept saying "Catálogo simulado" under a field already showing the 33 real departments loaded from the endpoint. That badge is where an author actually finds out which data they are looking at — which is the discoverability problem the rejected modal was reaching for, solved at the point of use.
- **No HTTP.** Connecting the simulator to the real catalog endpoints was considered and deferred: it buys real data at the cost of CORS, auth, and a simulator that stops working offline. Pasting gets the same data with none of that, and the bank is the structure a URL fetch would fill later anyway.

### Fechas máximas de presentación — the second simulator-only bank

`FechasMaximasPresentacion` (`src/types/maxDates.ts`) is the deadline table a municipality publishes: `{municipioId, ica[], reteica[], autoretencionIca[]}`, each a list of `ReglaAnio` `{anio, periodicidad, tipoDigito, fechas[]}`. The consumer fetches it from its own endpoint alongside the form config; **it is not in the exported JSON and not in the draft** — `exportForm` and `persistence` contain zero references to it, verified in the check script by asserting the export and the draft never mention `municipioId`, `periodicidad`, `tipoDigito` or `autoretencionIca`.

It exists here for the same reason the catalog bank does: without it the simulator cannot test anything that depends on a deadline. `src/lib/maxDates/` is the pure arithmetic and search; `src/lib/maxDatesBank/` is the `localStorage` layer (`form-orchestrator-fechas`); `panels/MaxDatesPanel` is the **Fechas** sidebar tab, the fifth that works with no field selected.

Settled decisions:

- **The model is flat on purpose.** Periodicity (1/6/4/12 periods) × digit validation (none / first / last digit of the document) is 12 combinations; each `FechaLimite` carries its own `periodo` and optional `digito`, so one shape covers `anual + ninguno` (1 entry) and `mensual + ultimo_digito` (120) with no discriminated unions and no special cases in the consumer. `fechasEsperadas(regla)` derives the expected count, which is how the panel spots a half-loaded dump — otherwise a missing period surfaces the day someone asks for exactly that one.
- **The names stay in Spanish** because this object *is* the API contract, same as `PAYLOAD_SCHEMA`'s leaves. Renaming `tipoDigito` is one line here and a breaking change there.
- **`digitoDe` returns `null` instead of a number, and that fixes two silent bugs** in the first sketch. `Number("")` is `0`, so an empty document picked the digit-0 deadline — a wrong date wearing a right one's face. A NIT with a letter gave `NaN`, which matches nothing and returned `undefined` with no clue why. Both now refuse to answer.
- **The generated table is read-only and recomputed from the clock.** `generarReglasAnuales(anioActual, cantidad, offset, mesDia)` produces the last 10 declarable años gravables; the **offset is the only difference between ICA and retención** — ICA declares the immediately previous year (offset 1, so año gravable 2025 falls due 2026/03/31), retención declares the current one (offset 0). Because it follows the clock, editing anything **forks a copy** (`source: "custom"`); accepting edits into a table that regenerates would lose them without a word.
- **ReteICA and autorretención ship empty.** Their deadlines are bimonthly or monthly depending on the municipality, and the builder only carries the ICA template. Generating them would be passing off data nobody gave — the same rule that stopped tarifas being invented. The structure is there, so loading them is pasting a dump.
- **Pasting takes the whole object, with no column naming.** Unlike a catalog — a flat list where the author has to say which key is the id — this response already has the shape needed, so the only job is checking that it does. `candidateObjects` unwraps one level, since these endpoints wrap in `{success, result}`. The paste and the stored value go through **the same Zod schema**, so nothing can enter by one door that the other rejects.
- **`default` / `custom` keeps what you loaded**, exactly like `StoredCatalog`: the pasted table lives in `custom` next to the generated one rather than replacing it.
- **The store holds no date logic.** `setMaxDates` receives a finished table and `setMaxDatesSource` flips the switch; the panel composes the next table with `conFechaAnual`. That keeps every rule in `lib/maxDates`, where a throwaway script can reach it.
- **Only `anual + ninguno` is editable by hand.** Everything else is 6 to 120 dates, which nobody types — the same argument that made catalogs paste-only.
- Cost: **+11.6 kB in the initial chunk** (panel, lib and its Zod schema). It is builder-side, like `CatalogsPanel`, so it belongs there; both lazy boundaries are unchanged.

### UVT y SMMLV — the third simulator-only bank

`ValorAnual` (`src/types/valores.ts`) is one row per year: `{anio, uvt, smmlv}`. The consuming app receives both from its own API; here they live in a bank of their own (`localStorage` key `form-orchestrator-valores`, `src/lib/valoresBank/`) so the simulator can compute against real numbers. **Not in the draft and not in the export** — verified in the check by asserting the exported JSON never contains `smmlv` or `1750905`, and that `exportForm.ts` never names `valoresBank`.

**They are deliberately NOT a `CatalogBank` entry, even though they are edited from the Catálogos tab.** A catalog is a list of `{id, label}` options feeding a dropdown; this is two scalars per year that nobody picks from a list. Storing them as catalog entries would mean putting a number inside `label` — a display string — and would offer them in the `dataSource` picker as an option source for a field, which means nothing. The UI lives in `panels/ValoresAnualesEditor`, rendered as the first section of `CatalogsPanel`, because that is where an author looks for "data the simulator needs"; the storage shape and the tab are separate questions.

The two script helpers are `uvt(año)` and `smmlv(año)` (`src/lib/scriptValores/`, names in `VALUE_HELPER_NAMES`). **Impure like the date helpers and for the same reason** — the table is not in the export — so they are built per run over `RuntimeContext`, which is now `{reglas, hoy, valores}`.

Settled decisions:

- **They return `null`, not `0`, when the year is not loaded.** A `0` would make any floor or cap written in UVT vanish in silence: `max(liquidada, 0 * 10)` is just `liquidada`, and the sanción mínima would disappear with nothing on screen to say so. With `null` the author writes the fallback where it can be seen — the ICA template does exactly that: `const UVT = uvt() ?? 52374;`. This is the opposite call from `diasDeMora` returning `0`, and the difference is that a missing deadline means "no lateness" (a real answer) while a missing UVT means "no data".
- **No argument means the current year**, taken from `context.hoy` and never from the clock, same discipline as `hoy` itself. That is what the sanción wants: it is liquidated with the UVT of the year of liquidation, not that of the año gravable.
- **`CONTEXT_HELPER_NAMES` is `[...DATE_HELPER_NAMES, ...VALUE_HELPER_NAMES]`** and both `SCRIPT_PARAM_NAMES` and `runFieldScript` derive from it. The date helpers are no longer last; what is guaranteed is the order of the context block. Getting this wrong shifts every following argument with nothing to warn you.
- **`resolver` guards `context.valores` with `Array.isArray`.** The consumer builds this object by hand and a version of it predating this feature does not carry the key; without the guard that is a `TypeError` inside the taxpayer's script instead of "no data".
- **The bank wins whole, or not at all** (`valoresEnUso`), exactly like a catalog: an active table missing the year asked for returns nothing rather than falling back to the factory rows. Mixing loaded and factory years gives a table where you cannot tell which is which.
- **The paste names its columns**, like a catalog and unlike the deadline table: this is a flat list, so there is no way to guess which key is the year. A row missing any of the three is **discarded whole** — half a row would store a `0` that passes for real data.
- **`leerNumero` tries the direct read before stripping separators.** The other order turns a perfectly readable `"52374.00"` into `5237400` — two orders of magnitude, silently. That `"1.750.905"` only survives the second attempt is precisely the signal that the dot groups there.
- **The factory table ships filled, 2020–2026, and that is not the same as inventing tarifas.** The UVT comes from a DIAN resolution and the SMMLV from a decree: one public number per year, not a value nobody supplied. The 2026 pair (52.374 / 1.750.905) is verified; the older rows are the published ones and are worth contrasting before liquidating an old declaration with them. The check asserts both columns rise monotonically, which is how a mistyped row gets caught.
- Cost: **+7.3 kB initial** (panel, lib and its Zod schema; builder-side like `CatalogsPanel`) and **+0.35 kB in the simulator** (the helper implementation). Both lazy boundaries unchanged.

### `fechaLimite` / `diasDeMora` / `mesesDeMora` — the deadline table inside a script

Three script helpers backed by the table above. `fechaLimite(año, periodo, documento)` returns `"YYYY/MM/DD"` or `null`; `diasDeMora(…)` returns days late, `0` when on time; `mesesDeMora(…)` returns **months or fraction of a month** late, which is the unit the sanción por extemporaneidad grows in — one day late is already one month. They live in `src/lib/scriptDates/`, and the name list is `DATE_HELPER_NAMES` in `src/constants/fieldScript.ts`.

**`mesesDeMora` is not `diasDeMora / 30`, and that is the whole reason it exists.** Only four months have 30 days, so the division drifts a day every couple of months and eventually charges **one month too many** — which here is 5% of the base. `mesesOFraccion` (`lib/maxDates`) counts by calendar instead: whole months come from the year/month difference, and the fraction is having passed the deadline's day-of-month. Verified against the cases the division gets wrong (`31/01 → 28/02` is 1, `31/03 → 30/04` is 1, a full year is 12 and not 13).

**They are the first helpers that are not pure.** The other ten only need their arguments, so they are a module constant; these need the loaded table, which is not in the export. So they are **built per run**, closing over a `RuntimeContext`.

`RuntimeContext` is `{reglas, hoy, valores}` and travels as a **second argument** to `resolveRuntime` and `validateRuntime`, never inside `RuntimeModel`. That separation is the design: the consumer receives the config JSON from one place and the deadline table from its own endpoint, so the simulator receives them the same way and the split is visible in the signature. `useFormPreview` is where the two meet.

Settled decisions:

- **The declaration kind is resolved once, at the top.** `buildRuntimeModel` reads `projectMeta.formType` into `model.declaracion`, and `useFormPreview` hands the helpers only the list that applies. So the helpers know nothing about ICA vs retención — they get *the* rules. An unset `formType` falls back to `ica`, the only one with a template.
- **`diasDeMora` returns `0` when there is no deadline, not `NaN`.** With no table loaded the alternative would poison every renglón downstream — the exact failure mode already recorded for renglón 35. And a sanción must never be born from missing data: no table, no mora. Same fail-open reasoning as a broken group check passing.
- **Dates are parsed by hand into UTC** (`aUtc` in `lib/maxDates`). `new Date("2025/03/31")` is local midnight while `new Date("2025-03-31")` is UTC midnight, so mixing formats moves a date by a day depending on the timezone — and one day here is the line between being on time and owing a fine. `aUtc` also round-trips the result, because `Date.UTC` silently rolls 31 February into 3 March instead of rejecting it.
- **`hoy` is a parameter, not a clock read.** It makes the mora verifiable without touching the system time, which matters with no test runner.
- **The graph needs no changes.** The inputs arrive as `{campo}`, so `scanScript` already records them as reads and the topological order is right for free.
- **They are part of the consumer contract**, like every other helper: the exported `compiled` calls them by name, so the consuming app must provide them with the same semantics. Nothing in the JSON declares which helpers exist — already true for `sum` and `dvNit`, and unchanged here.
- **The order comes from `DATE_HELPER_NAMES` in both places**, the same anti-drift trick `SCRIPT_HELPER_VALUES` uses with `Object.values`: adding one on one side and forgetting the other would shift every following argument with nothing to warn you.
- **All three are used by the template**: renglón 31 uses `mesesDeMora` (see "Sanciones") and renglón 37 uses `fechaLimite` and `diasDeMora` (see "Intereses de mora"). `fechaLimite` earns its place there by being the only one that can tell "on time" from "no table loaded" — `diasDeMora` returns `0` for both.
- Boundary: the **names** land in the initial chunk (the editor lists them), the **implementation** only in `FormSimulator`. Measured +1.2 kB initial, +0.77 kB simulator.

## Sanciones (renglón 31)

The **sanción por extemporaneidad** (art. 641 ET) is auto-liquidated. The rule lives **entirely inside renglón 31's `logic.script`** — municipal parameters, the choice of base, and the formula, in that order, in one place. `SANCION_EXTEMPORANEIDAD_SCRIPT` (`baseTemplate.constants.ts`) is only the **seed text**: from the moment the form is created it is `logic.script` on `valor_sancion` and belongs to the form's author.

**Do not move any part of it into the code or into the prelude.** This was tried the other way first — parameters and a `sancionExtemporaneidad()` helper in the prelude, the call in the field — and the user rejected it. The prelude is editable too, so the objection is not technical: a municipality asks to swap 5% for 10%, or to liquidate on a different renglón, and whoever handles that request opens renglón 31 and has to find the whole rule there. Split across two screens you have to already know the other half exists. The user's own experience is the argument: four months building a municipality's form strictly to the law, and the answer was "it works but it is too strict, put it back". **The law is the default here, never the constraint.**

The script declares `UVT`, `MINIMA_UVT`, `POR_MES`, `TOPE` and `base` as named constants at the top, with a comment on each saying what the ET asks for and which municipalities deviate. Shipped defaults are the legal ceiling — 10 UVT minimum, 5% per month, 100% cap — because the law is a maximum a municipality may only lower. **The UVT is read with `const UVT = uvt() ?? 52374;`**: the live value comes from the values bank (see above) and the literal is the fallback the author can see and update, since a helper that silently returned `0` would erase the minimum.

Settled decisions:

- **The base is renglón 25 (`total_impuesto_a_cargo`), and it cannot be 33, 34, 35 or 38.** Those four already include `valor_sancion` in their own sum, so liquidating on them closes a cycle in `fieldGraph`. This coincides exactly with the legal rule (art. 644 parágrafo 3: the base does not include the sanción itself) and with the common mistake the user's reference warns about — the impuesto a cargo is not the saldo neto after retenciones. **The consequence is that the saldo-a-favor-based caps (topes A/B/C/D) are structurally impossible here, not merely unbuilt.** The script says so in a comment at the `const base` line.
- **`valor_sancion` stays `type: "number"` with no `alwaysDisabled`.** The lock is decided by the script alone: the runtime treats `computed` as `disabled` (`PreviewField.tsx`), so returning a value locks the field and `return undefined` leaves it typeable. That single mechanism is what lets one renglón serve the sanción the system can liquidate and the three it cannot. **Declaring `alwaysDisabled` would trap the other three types in a read-only field.**
- **Only EXTEMPORANEIDAD auto-liquidates.** The first line of the script compares `{tipo_sancion}` against `TIPO_SANCION_EXTEMPORANEIDAD` and returns `undefined` otherwise — including when nothing is selected yet, which is how the form starts. This is the **second** hardcoded catalog id in the template, alongside `TIPO_SANCION_OTRA`; both break in silence if `tipos_sancion` is ever reordered.
- **"No lateness" is checked before the minimum.** The minimum is a floor for a sanción that exists; it must not invent one where there was none. Same fail-open family as `mesesDeMora` returning `0` with no table loaded: **no deadline table, no mora, therefore no sanción.**
- **The period argument is `1`, written as a named `const periodo` in the script.** ICA is annual. It is a constant rather than a literal precisely so a bimonthly municipality changes one line.
- **The sanción rounds to the thousand like every other renglón**, so the 10 UVT minimum reaches the field as 524.000, not 523.740.

### What is deliberately NOT built

Recorded because each was considered against the user's reference document and ruled out for a concrete reason, not for lack of time:

- **Sanción por corrección (art. 644) — documentation only, by explicit instruction.** The tariff is 10% of the greater value when the taxpayer corrects before an emplazamiento, 20% after one, and parágrafo 1 adds 5% per month of the original lateness when the corrected declaration was itself extemporánea. **All three need the prior declaration**, and there is none: the system is only now being deployed to Colombian municipalities, so there is no versioned history to diff against. Building it would mean inventing the "greater value". If it is ever built, it needs a stored previous declaration first — that is the blocker, not the arithmetic.
- **Art. 642 (post-emplazamiento, double rates).** Some municipalities apply emplazamiento and some do not, and where it exists the flag would arrive from an initial modal that does not exist yet. Without knowing whether one was issued there is no way to choose between 641 and 642, and defaulting to the harsher one is not defensible.
- **The ingresos-brutos and patrimonio-líquido branches** of art. 641 (used when there is no impuesto a cargo). Patrimonio líquido is simply not a field in this form. The ingresos branch is implementable without a cycle and was left out only because its cap is expressed in UVT and nobody has said whether these municipalities use it — it is the cheapest of these to add later.
- **Gradualidad (art. 640).** Depends on the taxpayer's sanction history over the prior two years. Same missing-history blocker as corrección.

## Intereses de mora (renglón 37)

Renglón 37 auto-liquidates too, with the same shape as the sanción: the whole rule inside `logic.script`, parameters on top, calculation below. `INTERES_MORA_SCRIPT` in `baseTemplate.constants.ts` is the seed text.

The formula is the official one (art. 634-635 ET): **`base × (TASA_ANUAL / DIAS_ANIO) × días`**, daily and simple — not the compound effective reading — rounded **up** to the thousand. The rate is the *tasa de usura* for consumo y ordinario certified by the Superfinanciera **minus 2 points**, and **the rate in force at the time of payment applies to the whole delay**, which is what makes a single constant correct instead of a per-period table. It **changes monthly**; the template ships August 2026 (27,66% E.A., usura 29,66%).

Settled decisions:

- **The base is `const base = {valor_a_pagar};` on its own line, and it is meant to be edited.** The user's requirement was that it accept any renglón, because municipalities differ; that already falls out of `{campo}` substitution, so the work was making the line obvious and saying which values are legal. **The only illegal one is renglón 38** (`total_a_pagar`) — it consumes the interest, so reading it closes a cycle. 33, 34, 35 and 25 were all probed against `fieldGraph` and none does; the check asserts both halves of that.
- **The default is renglón 35** because it is what is actually owed: it inherits 33's `max(…, 0)`, so with a saldo a favor it is 0 and no interest is charged on a debt that does not exist. Verified end to end.
- **Rounding is `ceil`, not `round`, and it is done in the script.** The municipality liquidates with `ROUNDUP(…;-3)`. This is the one renglón whose rounding is *not* the project's round-to-nearest, and doing it in the script is what keeps that visible; `applyRounding` still runs afterwards but is a no-op on a value that is already a multiple of a thousand. The check pins the property: never below the raw figure, never a thousand above it, and a one-day delay on a tiny debt costs 1.000 rather than being free.
- **`fechaLimite` decides whether to compute at all, and `diasDeMora` only supplies the number.** They look redundant but are not: `diasDeMora` returns `0` both when the taxpayer is on time and when no deadline table is loaded, and those must not be the same answer. A `null` from `fechaLimite` means "cannot tell", so the script returns `undefined` and the field **stays typeable** — which is exactly how renglón 37 worked before it had a script. A locked `0` would be indistinguishable from a calculation that ran and found no lateness.
- **`type: "number"` with no `alwaysDisabled`**, same mechanism as renglón 31: the script owns the lock.
- **The rate is a constant in the script, not a fourth bank.** A per-period table was considered and is only worth building if the delay has to be segmented by rate — and it does not, because the law applies the rate in force at payment. A column in the values bank was rejected for the opposite reason: that table is annual and this rate is monthly, so it would be wrong by construction.

### The script editor got a ceiling

The sanción script is ~50 lines, and `ScriptEditor` had a `minHeight` and no maximum, so CodeMirror grew to fit and pushed the error messages, the cycle warning and the "lee estos campos" list below the fold — in a sidebar panel, out of sight. `ScriptInput` now computes a `maxHeight` from a `maxRows` prop (default 18, and never below `rows`), and `.cm-scroller` declares `overflow: auto` explicitly so the ceiling becomes an internal scroll rather than a crop. Both limits travel as inline style on the host div and are inherited via `[&_.cm-editor]:max-h-[inherit]`, since CodeMirror draws inside and takes no classes.

## Conditional validations (`validations.overrides`)

A field's validation can change with another field's value. `FieldValidationOverride` is `{id, when: FieldCondition, validations: FieldValidationRules}` (`src/types/field.ts`), and `FieldValidations` is the same rules plus `overrides?[]`. `FieldValidationRules` exists separately from `FieldValidations` **so an override cannot nest overrides** — one layer, no recursion to resolve.

On the way out (`resolveValidations` in `exportForm.utils`) it becomes `validations: {zodSchema, zodSchemaWhen?: [{when, zodSchema}]}`. **The consumer walks `zodSchemaWhen` in order and takes the first whose condition holds; if none do, `zodSchema`.** `effectiveSchemaSource` is that rule, and both `collectErrors` and the required asterisk go through it, so the simulator can't drift from what the consumer must do.

The motivating case is in the ICA template: `numero_documento` accepts 7–10 digits, but 7–9 when `tipo_documento` is NIT, because the tenth digit is the DV and that lives in its own field. Three fields carry it — contribuyente, declarante and responsable — and each observes **its own** `tipo_documento` select, which is why `nitOverride(name)` takes the observed field's name.

Settled decisions:

- **An override merges onto the base, it does not replace it.** `mergeValidationRules` skips keys that are `undefined`, so an override declaring only `pattern` keeps the base's `required` and `message`. Writing an empty input in the panel clears the key rather than storing `0` or `""`, which is what makes "inherit" the default.
- **The alternative was two fields swapped by `visibleWhen`**, both bound to the same payload leaf. Rejected: it works today (hidden fields are neither validated nor sent) but it doubles three fields into six, and `buildPathIndex` is a `Map` keyed by path, so the payload view would silently show only one of each pair. Cross-field validation is the thing being modelled; the field count should not be the place it shows up.
- **Overrides are not edges in `fieldGraph`.** A validation override observes a field but no value flows through it, so it cannot take part in a cycle. `removeField` still prunes them (`pruneOverridesReferencing`), and an override pointing at a deleted field is dropped whole — half an override would apply always, which is the opposite of what was written.
- **`persistence.schema.ts` had to learn the shape.** `z.object` strips unknown keys, so without that branch a draft with overrides would have lost them silently on load. Any future addition to `FieldValidations` needs the same line.

## Conditions (`visibleWhen` / `enableWhen` / `alwaysDisabled`)

A field carries two independent `FieldCondition`s. `visibleWhen` decides whether it **renders at all**; `enableWhen` decides whether it is **editable**. They share the type, the operators, the store shape and the whole `ConditionEditor` / `useConditionEditor` machinery — the `kind: "enable" | "visible"` param is the only difference, and it picks which field is read and which setter is called.

Operator semantics live in `src/lib/fieldCondition/fieldCondition.ts` and are shared by the editor, the export and the graph: `operatorNeedsValue`, `operatorTakesList`, `operatorIsStringBased`, `parseConditionList`, and `operatorsForFieldType`, which narrows the offered list per field type (a `checkbox` only gets `isTruthy`/`isFalsy`, a `file` only gets `isEmpty`/`isNotEmpty`, and so on). Use these rather than re-deriving the rules inline.

Precedence the consuming app must apply, in this order:

1. `visibleWhen` false → the field is **not rendered and not validated**. Nothing below applies.
2. `alwaysDisabled` → rendered, read-only.
3. `enableWhen` false → rendered, disabled.

Settled decisions:

- **A hidden field's Zod schema is exported unchanged.** `buildZodSchema` knows nothing about `visibleWhen`, so a `required` + hidden field still exports `z.string().min(1)`. The consumer must drop hidden fields from the resolver — the builder deliberately does not weaken the schema, because when the field *is* visible the requirement is real. Same coordinated-consumer arrangement as `logic.script`.
- **Visibility is editable even when `alwaysDisabled` is on** (the enable editor is not — it is hidden, as before). Hiding a read-only field is a legitimate combination.
- `wouldCreateCycle` walks **every** edge kind, not just conditions. A cycle can span condition and script edges (`A.visibleWhen → B`, `B.script → A`), and a checker that follows only one would not see it.
- The candidate list in `LogicPanel` comes from `formSteps` only, so **a form-step field cannot condition on an intro-modal field** (or vice versa). Not a decision so much as an untouched limit — revisit if someone needs it.

## Commit conventions

- Write commit messages **in Spanish**, present tense, imperative ("Agrega X", "Corrige Y", "Amplía Z") — matches the existing history style (`git log`).
- Keep the subject line under ~72 chars and specific ("Agrega campo Archivo con presets de formatos" beats "Nuevo campo").
- **Keep bodies short — three or four lines at most, and often none.** The user asked for this explicitly: long explanatory bodies were getting in the way. Say the *why* in one or two lines if the diff doesn't show it, and nothing else; the durable detail belongs in `CLAUDE.md` and the README, not in the history. A subject line alone is fine for a mechanical change. On Windows, write the message to a file and use `git commit -F <file>`; PowerShell here-strings are unreliable through the tool layer.
- Do **not** add `Co-Authored-By: Claude` or similar trailers unless the user explicitly asks — the existing history doesn't use them.
- Prefer one commit per cohesive feature/decision. Split only when the parts are genuinely independent; don't split a single feature just because it touches many files.
- **Stage by explicit path.** Never `git add -A` or `git add src` — the user frequently has unrelated work in progress, and a broad add has already swept their files into a commit once.
- Line-ending noise: `.gitattributes` normalizes to LF, so `git status` should stay clean on Windows. If it doesn't, run `git add --renormalize .` once — don't stage random `M` lines as part of feature commits.

## Commands

Package manager is **pnpm** (`pnpm-lock.yaml` present, version pinned in `packageManager`) — use `pnpm install` / `pnpm add`, not npm/yarn/bun.

- `pnpm dev` — start Vite dev server
- `pnpm build` — typecheck (`tsc -b`) then production build via Vite
- `pnpm lint` — Biome check (linting + format check)
- `pnpm lint:fix` — Biome check with auto-fix
- `pnpm format` — Biome format, write mode
- `pnpm preview` — preview production build
- `pnpm exec tsx <script>.ts` — run a throwaway verification script

There is no test runner configured yet. **Biome is the enforced linter/formatter** (2-space indent, double quotes, semicolons, 100-char line width, auto-organizes imports on check) — `eslint.config.js` exists but is not wired into an npm script, so prefer Biome conventions when in doubt. `pnpm build` occasionally exceeds a 2-minute tool timeout on this machine; that is a harness kill (exit 143), not a build failure — re-run with a longer timeout before reporting a problem.

### Migrated from bun — what the swap actually cost

bun filled **two** roles and pnpm only replaces one. As a package manager the swap was free: no script in `package.json` ever named bun, `src/` contains zero bun APIs, and no config mentioned it. What needed replacing is bun's second role, **running TypeScript directly** — pnpm cannot do that, so `tsx` is a devDependency and the scratchpad checks run under `pnpm exec tsx`.

Settled decisions:

- **`pnpm-workspace.yaml` carries `allowBuilds`, not `package.json`.** pnpm blocks a dependency's install scripts by default; `@biomejs/biome` and `esbuild` (which arrives via tsx) both download a platform binary at install and are dead without it. pnpm 11 moved this setting out of `package.json` — a `pnpm.onlyBuiltDependencies` block there is silently ignored with only a warning.
- **`reicon-react` is pinned to an exact `1.1.2`, no caret.** Re-resolving the `^` ranges pulled 1.2.0, which **renamed icon exports in a minor** (`Maximize22` → `Maximize2`, `Save22` → `Save`, `AngleDown2` → `AngleDown`, and six more) and broke the typecheck. The pin keeps the migration a package-manager swap instead of a silent icon change. Unpinning means renaming those ten imports and eyeballing the result.
- **The other version bumps were verified, not assumed.** Biome 2.5.2 → 2.5.9 reformatted nothing across 472 files (only the `$schema` URL in `biome.json` needed updating). Vite 8.1.1 → 8.2.2 re-partitioned the chunks — the initial went 831 kB → **667 kB** and a third `fieldScript` chunk appeared — and **both lazy boundaries still hold**, verified by grepping the built chunks for `CUNDINAMARCA` (only in `FormSimulator`) and `cm-editor` (only in `ScriptEditor`).
- **The 1132 extensionless imports across `src/` did NOT need fixing.** They are normal for `"moduleResolution": "bundler"`, and tsx resolves them exactly like bun did. Node's own loader cannot — that limit is Node's, not pnpm's, and it is why tsx is here rather than `node --experimental-strip-types`.
- **The scratchpad needs three things** none of which are project files: a `package.json` with `{"type":"module"}` (without it esbuild rejects top-level `await`), absolute import specifiers written as `file:///C:/...` URLs (ESM refuses a bare `C:/`), and a `node_modules` junction to the project so a bare `zod` import resolves.

## Architecture

The app is a visual, drag-and-drop **step-by-step form builder** ("Form Orchestrator") that compiles its entire configuration down to a single structured JSON document.

### File layout conventions

Components follow **atomic design**: `src/components/atoms|molecules|organisms/`, plus `src/components/layout/`. Panels live under `organisms/panels/`. Each component and hook gets its **own folder** with co-located files — `X/X.tsx`, `X/X.types.ts`, `X/X.constants.ts`, `X/X.utils.ts` (only the ones it needs). Hooks follow the same pattern in `src/hooks/useX/useX.ts`, libs in `src/lib/<name>/<name>.ts` with the same suffixes.

`X.ts` should read as the module's public API — helpers, constants and types belong in the co-located files, not inline.

**A co-located `X.types.ts` / `X.constants.ts` is private to its folder.** The moment anything outside that folder imports from it, the declaration becomes global and moves to `src/types/` or `src/constants/`. Both directions were audited to zero; keep it that way when adding code. Two corollaries learned while applying it:

- When the leaking declaration drags its neighbours (a type that references sibling types, a constant that needs a private helper), **move the whole file** rather than splitting it — a partial move leaves `src/types` or `src/constants` importing from `src/lib`, which is worse than the original problem. That is why `types/exportForm.ts` and `types/payloadMapping.ts` are whole-file moves, and why `roundTo` lives unexported inside `constants/fieldScript.ts`. The reverse also happened: `NUMERIC_FIELD_TYPES` was private to `payloadMapping/` until `scriptRuntime` needed it, and moved to `constants/fieldTypes.ts`.
- Whatever stays genuinely private stays put: `FieldSpec` in `baseTemplate`, `TopologicalResult` in `fieldGraph`, `SALDO_NETO`, `CONDITION_COPY`, the tokenizer regexes.

The rule is **not enforced by tooling** — it was verified with throwaway audit scripts. Biome's `noRestrictedImports` was tried and does not fit: it only matches an exact import specifier, and the same target is spelled with a different relative path from every importer, so no single pattern covers "anything outside this folder." A tool that resolves to an absolute path (ESLint's `import/no-restricted-paths`) could do it; not in the stack.

Both import cycles this shape produced are fixed the same way: `findFieldById` moved from `formStore.ts` into `formStore.utils.ts` (the file that actually calls it), and `fieldMatchesSchemaType` moved from `payloadMapping.ts` into `payloadMapping.utils.ts` for the same reason. Each public file re-exports the moved function (`export { findFieldById } from "./formStore.utils"`, `export { fieldMatchesSchemaType } from "./payloadMapping.utils"`) so the external callers that import it alongside the rest of the module's public API don't move. That pattern — implementation in `.utils.ts`, public file re-exports — is the fix whenever a public-file function is needed by the code its own utils file already owns; the alternative, keeping the function in the public file and having `.utils.ts` import it back, only worked before because function declarations hoist. One cycle remains in the codebase: `types/field.ts` ↔ `types/catalog.ts` (each imports the other's type for a single field), harmless because type-only imports erase at compile — nothing to fix, just worth knowing it's there.

### Pieces

- **Setup wizard** (`src/components/organisms/SetupWizardModal/`, logic in `src/hooks/useSetupWizard/`): 2-step modal shown when `setupConfig.isComplete` is false. Step 1 picks `FormType` — `industria_comercio` loads `getIndustriaComercioFormTemplate()` and `getIndustriaComercioIntroTemplate()` (`src/lib/baseTemplate/`); the other two types start from a single blank row. Step 2 asks whether an intro modal is needed and, if so, how many steps — this seeds `introModal.steps`. `DraftRecoveryModal` (`src/components/organisms/DraftRecoveryModal/`) runs before the wizard on mount if `loadDraft()` finds a saved draft.
- **ICA template** (`src/lib/baseTemplate/`): the eight steps of the autoliquidable, built from `FieldSpec` rows — Datos/Contribuyente, Base gravable (renglones 8–16), Actividades gravadas (the repeatable group), Impuesto a cargo (17–25), Deducciones/sanciones/anticipos (26–34), Totales (35, 36, 38), Pago voluntario (39, 40), Firmas/Contador-Revisor. Computed renglones carry `type: "calculated"` + `script` + `alwaysDisabled` — all thirteen of them, verified. **Renglón 31 is the one field with a `script` that is deliberately neither** — see "Sanciones". `SALDO_NETO` is the shared subexpression behind the 33/34 a-cargo / a-favor pair, written as a bare expression (no `return`) because it is interpolated into `return max(…, 0);` and `return max(-(…), 0);`.

  **The tail of the liquidation chain — 33/34 → 35 → 38 → 40 — encodes one rule that is not in the official form.** `SALDO_NETO` splits into 33 (`max(neto, 0)`, a cargo) and 34 (`max(−neto, 0)`, a favor), and **35 is just 33**, so "if there is a saldo a favor there is nothing to pay" falls out of 33's own clamp with no condition written anywhere. 38 is then `max(35 − 36 + 37 − 34, 0)`.

  **That `− 34` is the part the label does not name**, and it is deliberate: with a saldo a favor 35 is 0, so without it the intereses de mora would be charged in full against a debt that does not exist. What is left to pay is only the amount by which the intereses exceed the saldo a favor, and below zero the answer is already declared in 34 — putting it in 38 as a negative would state it twice. The rótulo keeps the official wording ("Renglón 35 - 36 + 37"); the deviation is commented at the field.

  **Some municipalities want the opposite**: the saldo a favor shown in 35 as a negative valor a pagar, 38 free to go negative, and 39/40 signed. That variant is **not built** — it is 35's script swapping to the unclamped neto plus dropping 38's `max`. Settled with the user as a per-municipality change to make when one actually asks, not a mode to carry now.

  **`calculated` and `number` are behaviourally identical today** — same `case` in `buildZodSchema` (`z.number()`), same `case` in `PreviewFieldControl` (both render `PreviewNumberInput`), both offered the four numeric properties (`rounding`, `decimals`, `allowsNegative`, `formatted`), both in `NUMERIC_FIELD_TYPES` (`src/constants/fieldTypes.ts`, also what `coerceForScript` reads to decide a value is a number). The only difference is the palette label. **What actually makes a field read-only is `alwaysDisabled`**, applied in `formRuntime.utils.ts` where it takes precedence over `enableWhen`. So the type is declared intent the consumer can act on, not enforcement: a `calculated` field without `alwaysDisabled` is still typeable, which is how nine renglones shipped editable until they were audited.
- **State** — single Zustand store, `src/store/formStore.ts` (`useFormStore`), typed by `src/types/formStoreTypes.ts` plus the domain type files: `field.ts`, `formStructure.ts`, `setup.ts`, `placement.ts`, `ui.ts`, `store.ts`. Constructors, canvas-wide walkers and template bootstrapping live in `formStore.utils.ts`; `formStore.constants.ts` holds `THEME_STORAGE_KEY` and the `NO_ROWS` / `NO_GROUPS` sentinels. Holds:

  **`store/banksSlice.ts` is the one part that lives outside `formStore.ts`** — the three simulator-only banks (`catalogBank`, `maxDates`, `valores`), their initial `load*()` reads and their seven actions, typed by `types/banksSlice.ts` which `FormState` extends. It is spread into the store (`...createBanksSlice(set)`), so it is still one store and **every consumer keeps its ordinary `useFormStore((state) => state.setValores)`** — that zero-ripple property is what identified this as the right seam. The banks share nothing with the rest: they never touch `formSteps`/`introModal`, never enter the draft (`restoreDraft` leaves them alone) and never reach the export.

  It takes only `set`, not a zustand `StateCreator`'s `(set, get, api)`: no bank action reads state outside its own callback, and the longer call would push the `create<FormState>(…)` line past 100 columns, making Biome reindent all ~1000 remaining lines. Splitting anything else out of `formStore.ts` has the same trap — keep the `create` line short.
  - `formSteps[]` — the main form is **multi-step**; each `FormStep` has `stepId`, `title`, optional `subtitle`, its own `rows`, and optional `groups`.
  - `introModal.steps[]` — same shape minus `groups`.
  - `formScript` — the prelude shared by every field script.
  - `activeCanvas`: `{type: "formStep" | "introStep", stepId}` — which canvas is being edited.
  - UI state: `selectedFieldId`, `isSidebarOpen`, `sidebarTab`, `dragPlacement`, `rowDropTarget`, `rowDrag`, `draggingFieldId`, `hoveredTransferTarget`, `transferNotice`, `isDarkMode` (persisted to `localStorage` under `form-orchestrator-theme`), `lastSavedAt`.
  - `setupConfig` and the three simulator-only banks: `catalogBank`, `maxDates` and `valores` — each with its own `localStorage` key, none of them in the draft or the export. The banks and their actions live in `banksSlice.ts`; everything else in this list is in `formStore.ts`.
  - Selector helpers exported alongside: `getActiveRows`, `getActiveGroups`, `findFieldById`, `getAllFields`, `findRowContainingField`, `findRowById`.
  - Row/field mutations apply uniformly to whichever canvas holds the target id via `mapRowEverywhere`/`mapFieldEverywhere`. Notable actions: `addFieldToRow`, `moveField`, `removeField` (also clears any `enableWhen`/`visibleWhen` pointing at it), `updateField`, `setFieldName`, `updateFieldValidations/Styles/FileConfig`, `updateFieldApiBinding`, `setFieldScript`, `setFormScript`, `setFieldRounding`, `setFieldFormatted`, `setFieldAllowsNegative`, `setFieldDecimals`, `setFieldLabelFor`, `setFieldContent`, `addFieldRule`/`updateFieldRule`/`removeFieldRule`/`reorderFieldRule`, `addFieldOption`/`removeFieldOption`/`updateFieldOptionLabel`, `setFieldEnableWhen`/`setFieldVisibleWhen`, `addRowToActiveCanvas`/`updateRowColumns`/`removeRow`/`moveRow`, `moveFieldToStep`/`moveRowToStep`, `addGroupToActiveStep`/`addRowToGroup`/`updateGroup` (which is also how `checks` are written — no dedicated action)/`removeGroup`, the step actions for both canvases, `restoreDraft`.
  - **Selectors must return stable references.** Zustand reads them through `useSyncExternalStore`, which compares by identity, so a selector returning a fresh `[]` on every call causes "Maximum update depth exceeded". That is what the `NO_ROWS` / `NO_GROUPS` module-level constants are for — never inline an empty-array literal in a selector.
- **Field model** (`CanvasField` in `src/types/field.ts`): `name` (unique technical slug, `src/lib/fieldName/`), `type`, `label`, `colStart`, `colSpan`, `validations`, `styles`, `logic`, plus optional `title`, `options[]`, `fileConfig`, `alwaysDisabled`, `apiBinding`, `labelFor`, `content`, `tooltip`, `rounding`, `formatted`, `allowsNegative`, `decimals`, `enableWhen` and `visibleWhen` — the last two a `FieldCondition` `{fieldId, operator, value}`. Operators: `equals | notEquals | greaterThan | lessThan | startsWith | endsWith | contains | matches | in | isEmpty | isNotEmpty | isTruthy | isFalsy`. `logic` is `{script?, rules?}`. Field types come from `FIELD_TYPES` in `src/constants/fieldTypes.ts`, grouped by `FieldTypeCategory` — **básicos** (text, number, select, textarea, checkbox, calculated, file), **complejos** (search_select, toggle_group, radio_group, checkbox_group) and **contenido** (label, rich_text; see "Presentational fields"). `FieldPalette` renders one section per category from `PALETTE_SECTIONS`, skipping empty ones, so adding a type is only a `FIELD_TYPES` entry.
- **Grid**: `src/constants/grid.ts` — `GRID_BASE_COLUMNS = 16` is the default per-row column count; rows carry their own `columns` (clamped to `MIN_ROW_COLUMNS`…`MAX_ROW_COLUMNS`, 1–24) and shrinking a row clamps each field's `colSpan` to fit.
- **Two-column layout** (`src/components/layout/AppLayout.tsx`):
  - Left sidebar (`organisms/Sidebar/`): an icon rail (`SidebarTabRail`, includes the dark-mode toggle; clicking the active tab collapses the panel) over a tabbed panel — `SidebarTab` is `fields | attributes | validations | styles | logic | apiMapping | catalogs | fechas`, rendering `FieldPalette` + `panels/AttributesPanel|ValidationsPanel|StylesPanel|LogicPanel|ApiMappingPanel|CatalogsPanel|MaxDatesPanel`. `fields`, `catalogs` and `fechas` are the three that work with no field selected. `LogicPanel` hosts `FieldScriptEditor`, `FieldRulesEditor` and `ConditionEditor` — the last one twice, told apart by its `kind` prop. `logic` is the fourth tab that works with no field selected: there it renders `FormScriptEditor`, the prelude. `FileOptionsEditor`, `NumberOptionsEditor` and `FieldOptionsEditor` handle type-specific config.
  - Right canvas (`organisms/Canvas/Canvas.tsx`): grid drop targets (`@dnd-kit` `useDroppable` per row, one row = one grid), laid out by `CanvasRowsGrid` which blocks consecutive rows of the same group into a `RepeatableGroupBand`. `CanvasTabs` switches `activeCanvas`; `StepTitleEditor` edits title/subtitle; `RowColumnsMenu` changes a row's column count and `FieldResizeHandle` + `src/hooks/useFieldResize/` drag-resizes `colSpan`; `FieldContextMenu` (right-click, via `src/hooks/useFieldContextMenu/`) offers per-field actions. The header carries `SaveButton`, a "Ver JSON" toggle rendering `JsonPreviewCanvas`, a payload-coverage view in `PayloadPreviewCanvas`, and "Exportar JSON". The intro-modal canvas renders inside a decorative fake-modal frame.
  - Drag-and-drop wiring (palette → row, canvas field → row, row → new position) lives in `src/hooks/useDragAndDrop/`; `App.tsx` only wires `DndContext`/`DragOverlay`. Every palette drop creates the field directly — options are configured later, see "Options and `apiBinding`".
- **Payload mapping** (`src/lib/payloadSchema/`, `src/lib/payloadMapping/`): `PAYLOAD_SCHEMA` is the hardcoded `DeclaracionIcaE` contract. `buildMappingTree` pairs every leaf with the field bound to it and flags type mismatches, orphan bindings and host-provided leaves; `PayloadPreviewCanvas` renders it.
- **Persistence** (`src/hooks/useAutosave/`, `src/lib/persistence/persistence.ts`): autosaves to `localStorage` on an interval once setup is complete; `src/hooks/useKeyboardShortcuts/` binds Ctrl/Cmd+S to the same save. `loadDraft`/`clearDraft` back the recovery modal. The draft carries `schemaVersion` and **migrates before validating** — the other way round would discard every older draft precisely when the migration could have saved it. Steps live in `persistence.migrations.ts`, indexed by the version they come *from*, and work on the raw object, so they may assume no shape: they add or transform keys and let Zod judge the result. A gap in the chain stops the walk and leaves the old version in place, which is what `z.literal(DRAFT_SCHEMA_VERSION)` then rejects. **Every shape change needs a step here**, and note that `z.object` silently strips keys the schema stops declaring — so removing a field from the schema without migrating its data loses it without a word. The one shape change that does **not** need a version bump is a purely additive optional key (`rounding` was one): an older draft simply lacks it and still validates. It does still need its line in `persistence.schema.ts`, and forgetting that line is the same silent-strip trap from the other direction — the property saves fine and comes back gone after a reload.
- **Output** (`src/lib/exportForm/`): `downloadFormExport`/`buildFormExport` serialize `projectMeta`, `setupConfig.introModal`, and `formSchema.steps[]` — each step with its `rows[].fields[]` (`colStart`, `colSpan`, `styles`, `validations.zodSchema` from `src/lib/zodSchema/`, `logic` (`script` as `{source, compiled, reads}`, plus `rules`), `options`, `fileConfig`, `alwaysDisabled`, `apiBinding`, `labelFor`, `content`, `tooltip`, `rounding`, `formatted`, `allowsNegative`, `decimals`, `enableWhen`, `visibleWhen`) plus `groups[]` (with `min`/`max`/`arrayPath`, a `buildGroupZodSchema` array schema and `checks[]`) and `rows[].groupId` — plus `formSchema.gridBaseColumns` and `formSchema.prelude` (the shared script, sent once rather than repeated inside every `compiled`), into one downloadable JSON file. Field ids in conditions, rules **and `labelFor`** are **resolved to names** on the way out. `validations.zodSchema` is **optional**: presentational fields omit it, and its absence is how the consumer knows there is nothing to validate.

### Prescribed stack (from spec, already in package.json)

- `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop (not react-dnd)
- `react-hook-form` + `@hookform/resolvers` + `zod` for building/validating generated form fields (Zod schemas are authored dynamically per-field and stored as part of the field config, e.g. `"z.number().min(0)"`)
- `zustand` for the canvas/builder state tree
- Tailwind v4 (via `@tailwindcss/vite`) for all styling — no CSS-in-JS; dark mode is class-based (`document.documentElement.classList.toggle("dark", …)` in `App.tsx`), so every new surface needs its `dark:` variants
- `uuid` for generating field/row/step ids
- `reicon-react` for icons (not lucide/heroicons)
- `@codemirror/*` + `@lezer/highlight` for the script editor. Added late, not from the spec, though the spec did ask for "un editor de código embebido (tipo Monaco Editor)" — CodeMirror was picked over Monaco because it is far lighter and TypeScript diagnostics are not needed (the script is JS). **It only ever loads behind the `React.lazy` in `ScriptInput`**; a static import anywhere pulls 457 kB into the initial chunk.

### Code style

- **Comments are in Spanish, `//` only — never JSDoc `/** */`.** In TypeScript a JSDoc block restates the types already in the signature: pure noise, and the first thing to rot. Written without accents, matching what is already there.
- **`src/lib/`, `src/store/` and `src/hooks/` carry a header comment per file** stating the file's *role* and its boundary, plus targeted comments where there is a trap, an invariant the code cannot express, or a decision with a discarded alternative. The bar is deliberately high: **if the comment can be deduced from the line below it, it does not get written** — that is the only thing keeping these from aging into lies. `.types.ts` files of a handful of obvious fields get nothing.
- `src/components/` is **not** commented as a matter of course. JSX is mostly self-describing, and the density there would cost more than it returns. Add one only when a component hides a real decision.
- **Explicit type annotations** on local declarations (`const isIntro: boolean = …`), matching the existing files.
- Biome conventions win over `eslint.config.js` (which isn't wired into a script).
