# @varo-ui/headless

## 2.1.0

### Patch Changes

- Absorb HeroUI-inspired checkbox, collapse, tag, and breadcrumb motion, and use white foregrounds on WeChat green action fills.

- Replace input-number ASCII steppers with named VIcon plus/minus controls and restore its compact inline geometry, pin textarea word-limit to the bottom-right, use a circular cancel-x on Input/Select without stretching Select on focus, avoid the native Input `focus` prop/handler collision, add dual-target multi-column Picker, DateField, PullRefresh, Signature, and Watermark Registry components while keeping Calendar independent, add shared motion tokens and Spectrum-inspired Button, Switch, Radio, Toast card, and VToastRegion interactions without changing the Varo palette, teach weapp-web native controls to preserve hover and ARIA semantics without Glass-Easel property warnings, pad docs API tables, preview compiled mini-program artifacts through weapp-web, and add a root `docs:dev` command with in-page H5 and Weapp primitive previews.

## 2.0.0

### Minor Changes

- Add cancellable Dialog open-change details and preserve browsing for readonly Select fields.

  Fix native icon mask serialization, style-v2 control geometry, and Agent primary foreground token usage. Document Wevu 7 managed styles and the native Select contract.

  Keep native input and textarea grids within their containers, leave omitted input label widths unconstrained, and show the native Select clear action only during interaction.

  Preserve selected labels when reopening native Select fields, dismiss on outside taps, and close single-selection panels when reselecting the current value without emitting duplicate value changes.

  Use the native muted text token for selected-label previews while Select is open, restoring normal text color on search input or dismissal.

  Emit class-only native component WXSS using native style isolation, preserve the canonical Agent button reset, and reject unsupported compiled tag, ID, or attribute selectors during mini-program builds.

  Keep the native Mall search, category grid, product cards, and Agent panel within their layout tracks. Reuse styled button sizing and pass numeric pixel dimensions to Mall icons.

- Add a first-class `text` Button variant with semantic tone colors, pressed feedback, custom-color support, and H5/Weapp examples.

### Patch Changes

- Apply reactive H5 theme variables, contrast-safe action colors, accessible dialog/form/select behavior, SVG icon geometry, and Registry-first documentation and demo paths across H5 and Weapp targets.

## 1.2.0

## 1.1.0

### Minor Changes

- Add a complete Varo retail starter, seven installable retail blocks, and screenshot-first Block documentation. Route Block controls through headless-backed Base Kit components, add reusable image-state and number-field primitives, and expose the pure theme factory for build-time mini-program theming.

## 1.0.1

### Patch Changes

- Add package READMEs and tree-shakeable module entries.

## 1.0.0

### Major Changes

- Initial stable release of the platform-neutral Varo headless state and interaction contracts.
