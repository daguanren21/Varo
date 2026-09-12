# @varo-ui/h5

## 2.1.0

### Minor Changes

- Absorb HeroUI-inspired checkbox, collapse, tag, and breadcrumb motion, and use white foregrounds on WeChat green action fills.

### Patch Changes

- Give VIcon empty native string defaults, restyle toast as a dark mobile capsule, let input-number fill stretched parents without overflowing narrow tracks, animate collapse row tracks, and document Weapp breadcrumb href as select-only.

- Updated dependencies:
  - @varo-ui/headless@2.1.0
  - @varo-ui/theme@2.1.0

## 2.0.0

### Major Changes

- Replace the Select `searchable` prop with `filterable` and move local filtering into the Select field so the expanded panel no longer renders a second search input.

### Minor Changes

- Expand the semantic color system with WeChat primary scales, complete status, neutral, fill, border, background, info, and dark-mode variables across theme, H5, Weapp, and Registry surfaces.

- Add cancellable Dialog open-change details and preserve browsing for readonly Select fields.

  Fix native icon mask serialization, style-v2 control geometry, and Agent primary foreground token usage. Document Wevu 7 managed styles and the native Select contract.

  Keep native input and textarea grids within their containers, leave omitted input label widths unconstrained, and show the native Select clear action only during interaction.

  Preserve selected labels when reopening native Select fields, dismiss on outside taps, and close single-selection panels when reselecting the current value without emitting duplicate value changes.

  Use the native muted text token for selected-label previews while Select is open, restoring normal text color on search input or dismissal.

  Emit class-only native component WXSS using native style isolation, preserve the canonical Agent button reset, and reject unsupported compiled tag, ID, or attribute selectors during mini-program builds.

  Keep the native Mall search, category grid, product cards, and Agent panel within their layout tracks. Reuse styled button sizing and pass numeric pixel dimensions to Mall icons.

- Add a first-class `text` Button variant with semantic tone colors, pressed feedback, custom-color support, and H5/Weapp examples.

### Patch Changes

- Refine FixedNav, Indicator, Menu, Navbar, and Pagination into task-focused navigation examples and add explicit accessible relationships, labels, current states, and popup semantics.

- Refine Textarea, Uploader, Grid, and RegionPicker behavior with fixed mobile sizing, SVG file icons, readable grid labels, and leaf-aware region breadcrumbs.

- Refine Divider, Grid, Layout, and Space examples into task-focused cross-runtime surfaces, and add keyboard activation for clickable Grid items.

- Add bilingual Badge documentation, text-anchor examples, semantic solid foregrounds, and tone-aware soft and outline variants.

- Remove visible borders from solid buttons, add lighter hover and pressed color tokens, and keep loading feedback distinct from disabled styling.

- Add accessible input labels for Range, Searchbar, and ShortPassword, and refine cross-runtime form component examples into complete task-focused interactions.

- Add a five-stage RAG pipeline with linked citation motion, cancellation and reduced-motion support; synchronize public H5/Weapp stylesheets with the Registry motion and source-color tokens, and keep native workspace close controls aligned to the trailing edge.

- Refine the Elevator example into an interactive service-city directory and expose active index state with aria-pressed across H5, Weapp, and Registry sources.

- Constrain Map dimensions, make current-location rendering opt-in, and keep embedded Form maps from capturing page gestures.

- Apply reactive H5 theme variables, contrast-safe action colors, accessible dialog/form/select behavior, SVG icon geometry, and Registry-first documentation and demo paths across H5 and Weapp targets.

- Refine Switch states, add complete Popover component documentation and demos, and redesign AgentApproval with semantic light and dark decision states across H5, Weapp, and Registry sources.

- Measure Sticky fixed state from the rendered element, add complete runtime styles for Divider, Grid, Layout, Space, and Sticky, and replace the Sticky docs preview with a real page-scroll order feed.

- Updated dependencies:
  - @varo-ui/headless@2.0.0
  - @varo-ui/theme@2.0.0

## 1.2.0

### Patch Changes

- Updated dependencies:
  - @varo-ui/headless@1.2.0
  - @varo-ui/theme@1.2.0

## 1.1.0

### Minor Changes

- Add a complete Varo retail starter, seven installable retail blocks, and screenshot-first Block documentation. Route Block controls through headless-backed Base Kit components, add reusable image-state and number-field primitives, and expose the pure theme factory for build-time mini-program theming.

### Patch Changes

- Updated dependencies:
  - @varo-ui/headless@1.1.0
  - @varo-ui/theme@1.1.0

## 1.0.1

### Patch Changes

- Add package READMEs and tree-shakeable module entries.

- Updated dependencies:
  - @varo-ui/headless@1.0.1
  - @varo-ui/theme@1.0.1

## 1.0.0

### Major Changes

- Initial stable release of the Varo cross-runtime component system.

### Patch Changes

- Updated dependencies:
  - @varo-ui/headless@1.0.0
  - @varo-ui/theme@1.0.0
