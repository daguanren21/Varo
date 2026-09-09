# @varo-ui/cli

## 2.0.0

### Major Changes

- Replace the Select `searchable` prop with `filterable` and move local filtering into the Select field so the expanded panel no longer renders a second search input.

- Support third-party local and HTTP registries and self-contained shadcn-vue exports. Registry resolution now returns a Promise; await resolveRegistryItems().

  Reject lossy non-UTF-8 exports and conflicting file/ancestor destinations before emitting an export or writing consumer files, while preserving byte-for-byte binary installs.

  Accept standard shadcn-vue catalog and item definitions for local/HTTP installation and self-contained export, resolve consumer aliases, and relocate imports between installed Vue/TypeScript files without requiring Varo-specific manifest fields.

### Minor Changes

- Add the Weapp-only VRobotChat Registry component with typed chatbotwidget initialization, lifecycle feedback, event forwarding, and an editable operate-card generic.

- Add a five-stage RAG pipeline with linked citation motion, cancellation and reduced-motion support; synchronize public H5/Weapp stylesheets with the Registry motion and source-color tokens, and keep native workspace close controls aligned to the trailing edge.

- Add cancellable Dialog open-change details and preserve browsing for readonly Select fields.

  Fix native icon mask serialization, style-v2 control geometry, and Agent primary foreground token usage. Document Wevu 7 managed styles and the native Select contract.

  Keep native input and textarea grids within their containers, leave omitted input label widths unconstrained, and show the native Select clear action only during interaction.

  Preserve selected labels when reopening native Select fields, dismiss on outside taps, and close single-selection panels when reselecting the current value without emitting duplicate value changes.

  Use the native muted text token for selected-label previews while Select is open, restoring normal text color on search input or dismissal.

  Emit class-only native component WXSS using native style isolation, preserve the canonical Agent button reset, and reject unsupported compiled tag, ID, or attribute selectors during mini-program builds.

  Keep the native Mall search, category grid, product cards, and Agent panel within their layout tracks. Reuse styled button sizing and pass numeric pixel dimensions to Mall icons.

- Add a first-class `text` Button variant with semantic tone colors, pressed feedback, custom-color support, and H5/Weapp examples.

### Patch Changes

- Add immutable Agent thread branching, scoped context permissions, visible retrieval receipts, task controls, thread versions, placement shells, and the dual-target Agent Workspace Block.

- Keep one shadcn-style Form API and import entry across H5 and Weapp while installing target-owned Vue or native Wevu renderers, and document the Reka UI and vee-validate compatibility boundaries.

- Refine FixedNav, Indicator, Menu, Navbar, and Pagination into task-focused navigation examples and add explicit accessible relationships, labels, current states, and popup semantics.

- Refine Textarea, Uploader, Grid, and RegionPicker behavior with fixed mobile sizing, SVG file icons, readable grid labels, and leaf-aware region breadcrumbs.

- Refine Divider, Grid, Layout, and Space examples into task-focused cross-runtime surfaces, and add keyboard activation for clickable Grid items.

- Add accessible input labels for Range, Searchbar, and ShortPassword, and refine cross-runtime form component examples into complete task-focused interactions.

- Ship copy-owned Weapp Registry renderers as target-specific native Wevu SFCs with explicit target dependencies and a production catalog build gate.

- Refine the Elevator example into an interactive service-city directory and expose active index state with aria-pressed across H5, Weapp, and Registry sources.

- Constrain Map dimensions, make current-location rendering opt-in, and keep embedded Form maps from capturing page gestures.

- Terminate Agent stream connections on protocol terminal events, validate Registry manifests at install time, and roll back partial Registry file writes.

- Apply reactive H5 theme variables, contrast-safe action colors, accessible dialog/form/select behavior, SVG icon geometry, and Registry-first documentation and demo paths across H5 and Weapp targets.

- Refine Switch states, add complete Popover component documentation and demos, and redesign AgentApproval with semantic light and dark decision states across H5, Weapp, and Registry sources.

- Require the Wevu 7.0.4 and weapp-vite 7.0.4 toolchain, adopt the built-in weapp-tailwindcss 5.5.1 pipeline, and preserve typed editable components with native-safe nullable and union prop descriptors.

- Measure Sticky fixed state from the rendered element, add complete runtime styles for Divider, Grid, Layout, Space, and Sticky, and replace the Sticky docs preview with a real page-scroll order feed.

## 1.2.0

### Minor Changes

- Add the official Weapp theme CSS renderer and Vite integration, plus the editable `VThemeProvider` Registry component for reactive page-root theme switching.

## 1.1.0

### Minor Changes

- Add a complete Varo retail starter, seven installable retail blocks, and screenshot-first Block documentation. Route Block controls through headless-backed Base Kit components, add reusable image-state and number-field primitives, and expose the pure theme factory for build-time mini-program theming.

## 1.0.1

### Patch Changes

- Add package READMEs and tree-shakeable module entries.
- Polish Agent artifact, source, attachment, composer, and streaming conversation Registry demos.

## 1.0.0

### Major Changes

- Initial stable release of the Varo cross-runtime component system.
