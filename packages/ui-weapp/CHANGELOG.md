# @varo-ui/weapp

## 2.2.1

### Patch Changes

- Updated dependencies:
  - @varo-ui/headless@2.2.1
  - @varo-ui/theme@2.2.1

## 2.2.0

### Minor Changes

- Cut over the six-package fixed release group to canonical Registry authorship and native Wevu source delivery, without compatibility renderers or legacy export shims.

  Breaking migration:

  - `@varo-ui/weapp` now exports native Wevu `.vue` source for `weapp-vite`, not Vue render-function wrappers. The former `@varo-ui/weapp/primitives` API and Vue-Weapp primitive renderer are removed. Use the native root exports, direct `@varo-ui/weapp/components/*.vue` imports, or CLI-installed SFCs with `@varo-ui/weapp/resolver`. Compiler/runtime peers remain `weapp-vite` and `wevu` `>=7.2.1 <8`; repository fixtures use 7.4.0.
  - Remove TypeScript imports from `@varo-ui/h5/source`, which leaked private workspace dependencies. Use `@varo-ui/h5`, `@varo-ui/h5/primitives`, or editable Registry source. `@varo-ui/h5/style.css` and CSS-only `@varo-ui/h5/source/style.css` remain supported.
  - `@varo-ui/headless` is framework- and DOM-neutral. Move `useBodyScrollLock` imports to `@varo-ui/h5/primitives` in H5 consumers only. Shared reactive contracts have one owner; form submit/failed handlers use named `SubmitPayload` (`FormSubmitPayload` in form source APIs), containing `values`, `errors`, and optional platform-specific `event`, not a raw DOM event.
  - `themes/base` now installs only tokens and foundation. Ordinary component CSS is owned by component manifests; Agent tokens/helpers are optional `themes/agent` dependencies. Reinstall the selected dependency closure. H5 source imports that closure automatically. Native source consumers must globally include every installed `src/styles/*.css` through `weapp.styles` with `include: 'app.vue'`, `varo.css` first; do not import global CSS into component-local WXSS. Native npm consumers place `@import "@varo-ui/weapp/style.css";` in local `src/package.css` and globally register `{ source: 'package.css', include: 'app.vue' }` rather than passing an absolute package path.
  - Choose Agent presentation, conversation, workspace, advanced, and RAG Registry units explicitly. `blocks/agent-chat` installs the conversation closure without advanced/RAG/fine-tuning files; `components/agent-ui` deliberately remains the full suite. Approval, network, retry, and cancellation execution policy stays application-owned; no provider SDK or business-policy execution is introduced.
  - Disabled/readonly inputs reject mutation, accepted changes notify once, and no-ops do not notify. Drawer and Dialog `openChange` cancellation is synchronous before state/model/close transitions. Native handlers receive one `[open, details]` tuple, matching Wevu's single-detail event boundary; H5 retains two callback arguments. The same native tuple convention applies to ComposerScope `toggle`, Workspace `toggleSource`, FileDiff `expand`, and MenuItem `select`. Native close buttons use an explicit handler rather than a nested headless-method template binding.
  - H5 Drawer and Dialog restore focus to the external opener when no primitive trigger is rendered. Canceling a close retains modal focus and scroll ownership; accepted closure restores only a still-connected element.
  - Native optional controlled props preserve absence instead of silently becoming `false`, `0`, or an empty string. Uncontrolled inputs, overlays, Menu, and FileDiff retain their local defaults and accepted updates; explicit supplied values remain controlled. Optional selection limits, inherited clickability, elapsed times, and badges preserve the same absence distinction.

  Renderer families remain `h5` and `weapp`. The additional `alipay`, `tt`, `xhs`, `donut-android`, `donut-ios`, and `donut-ohos` install profiles are experimental and fail closed unless every transitive manifest admits the exact profile. Representative admission covers button, input, input-otp, form, checkbox, switch, drawer, card, and icon plus required utilities/themes, not the entire catalog. Donut uses WeChat compilation and separate per-host metadata, not a new renderer/compiler or a certified packaged app.

  Author renderers and styles in root `registry/`, then run `pnpm sync:registry`; package renderers/native trees, repository installs, and the docs Agent source/support catalog are projections. `pnpm check:generated` and `pnpm check:architecture` enforce drift/boundaries. After synchronization and package builds, `pnpm check:consumers` exercises packed/source consumers; `pnpm check:platforms` builds/checks all seven native artifact profiles at `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>` (runtime files in nested `dist/`). These commands are verification entrypoints, not claims of independent acceptance, IDE/device execution, Donut SDK packaging, signing, or fabricated AppIDs. Review local customizations before forced source replacement; no automatic merge is provided.

  Generated whole-file ownership is tracked in `scripts/registry-projections.json`. The read-only generated check rejects obsolete owned outputs; synchronization removes only unchanged obsolete files with recorded digests. Modified obsolete files and newly conflicting authored files fail before mutations. Authored renderer files receiving generated style imports remain outside deletion ownership. The former unreferenced Agent CSS projections were removed without deleting authored neighbors.
  Preflight preservation applies to one projection owner invocation, not the complete three-script sequence or crash/disk-failure rollback. Do not run concurrent writers or remove the inventory to bypass ownership conflicts.

  ESLint and Stylelint derive whole-file exclusions from the projection inventory; authored Registry inputs remain linted. Generated H5 style imports follow authored imports while preserving dependency-closure order, so staged formatting and generation agree. Preserve Switch/Checkbox's simple negation selectors and Button's existing complex selectors so formatting does not change cascade specificity. Run `pnpm check:generated` after formatting before publication.

  Upgrade the repository's native compiler/runtime fixtures to `weapp-vite`/`wevu` 7.4.0 and the four glass-easel preview packages to 1.2.1, with matching root and standalone Realworld lockfiles. Consumer verification resolves the installed compiler/runtime rather than pinning a second baseline in its script. The observed plain-native-slot provider-context limitation remains tracked in [weapp-vite #1172](https://github.com/weapp-vite/weapp-vite/issues/1172); this dependency upgrade is not a context fix or IDE/device certification.

  Fix native build-time theme hook ordering: transform source CSS early, but append configured page variables after the native compiler emits `app.wxss`. This preserves Realworld brand overrides through the sidecar pipeline without changing its artifact assertions or the public theme API.

  Keep the upstream-blocked native Dialog diagnostic in a separately selectable preview page so unrelated base-control and Drawer verification can run. Preserve its tuple/cancellation diagnostics and visible blocked status without swallowing errors, changing compiler slot semantics, or claiming #1172 resolved. Bilingual Dialog/Menu docs distinguish event contracts from deferred native runtime evidence.

  Fix Realworld nested-state persistence after the Wevu Store migration. Its app-owned `createAedPinia()` plugin subscribes through the public Store `$subscribe` lifecycle after state adoption, replacing the setup-local deep watch. Install the manager before store construction. Preserve the existing storage key/shape, transient navigation payloads, manager isolation and disposal; local bootstrap verification does not claim real login, update-service or device execution.

### Patch Changes

- Add headless-backed InputOTP and Drawer components for H5, Weapp, and Registry consumers.

- Upgrade compatible Vue, Weapp, Markdown and build dependencies. Migrate Vitest 5 configuration discovery and vite-plugin-dts 5 declaration bundling, keeping published H5 type entrypoints self-contained without changing component implementations.

- Redesign all 13 Registry Blocks with a restrained, typography-led layout across their supported H5 and native renderers, preserving public data and event contracts. Remove unused retail style dependencies.

  Fix cold-entry product loading, require a successful fresh quote after checkout failure, and prevent completed submissions from navigating away from hidden or detached checkout pages. Register standalone-export filesystem regressions with Vitest so failures reach the standard test command. Document the retail source export separately from commercial proposals.

  Keep long Block titles, product names, badges, status labels, and city options readable within narrow layouts. Preserve keyboard focus on H5 input clear actions and restore input focus after clearing. Ship 44px Agent send controls in copied source, correct descendant utility selectors, and remove the obsolete category Tag dependency.

  Make the native playground's external chatbotwidget demo explicitly opt-in so retail pages and Blocks boot without plugin authorization. Keep browser-preview artifacts separate from DevTools output and preserve the standalone retail export's plugin-free source closure and provenance.

  Restore native composite Button content and external form association. Preserve optional Agent draft ownership without overriding controlled empty values, fix category navigation and reactive cart action copy, and provide 44px native checkbox, switch, and quantity-control hit regions. Exercise these contracts with positioned native touch sequences rather than synthetic tap-only checks.

  Reconcile native and browser numeric input text after unchanged bound normalization without duplicating accepted-value events. Preserve native editing drafts and controlled updates, and repair the equivalent H5 and legacy contract-preview blur paths. Support the native form-field-button declaration in the browser artifact adapter with real form ownership, native-shaped submit/reset events, and explicit rejection of unsupported behavior declarations.

  Carry canceled browser-preview pointer taps into the matching HTML click default action, and stop disposed preview backends from forwarding later interactions.

  Route terminal touch gestures to the live preview backend after same-document remounts. Reconcile native Markdown children and code rows by position rather than nonexistent item-index keys, preserving append, replacement, clearing, and replay behavior without duplicate-key diagnostics.

  Align native checkbox labels without reducing their 44px hit regions. Use 20px Block headings and 14px ordinary text, keep H5 form fields at their existing readable sizes, and prevent documentation thumbnails from enlarging beyond a 375px viewport or inheriting prose image margins. Shorten the bilingual retail onboarding and separate commercial proposal pages.

  Keep H5 inputs and documentation previews within narrow containers. Wrap long RobotChat queries without clipping and keep localized action labels on one line.

  Refresh native Block previews from a measured 375px DevTools viewport, excluding simulated system chrome and retaining original captures with viewport and crop metadata.

  Use a native layout container for Tag slot content so reactive labels repaint instead of retaining their initial text.

  Keep native automation and compiler-backed form fixtures compatible with repository lint gates. Scope the Vue-only iteration-key exception to stateless native Markdown/code renderers, preserving H5 key and native syntax checks. Preserve native model-event spelling and compatible own-property validation during autofix; exclude generated CLI Registry copies from formatting so they remain byte-identical to authored source.

  Add an explicit uni-app Vue 3 retail export for H5 and WeChat while preserving the default Wevu export. Convert the reached source, native metadata, lifecycle hooks, event contracts, static assets and platform styling into a standalone, locked project with recursive native artifact verification. Preserve H5 keyboard activation and field accessibility names, keep fixed actions above the tab bar, and commit pending field input before blur/submission without accepting stale queued events. Document both export choices, their distinct DevTools roots, dependency constraints and simulation/device-verification limits without adding paid gates.

  Pin the uni starter to a security-patched, compatibility-validated Vite/plugin set with strict peer checks. Apply a versioned upstream H5 input/textarea patch to flush queued input before blur and cancel timers on unmount instead of filtering events after framework reconciliation. Keep unassembled template metadata out of workspace package discovery while preserving isolated exported-project typechecking.

  Integrate the retail starter with Registry-first native source delivery: preserve Block and input fixes in canonical renderer files, keep Agent Chat limited to its conversation dependencies, and export the transitive component stylesheet closure globally with base tokens first. Use the neutral native primitive bridge instead of removed Vue renderer exports and align the standalone Wevu compiler/runtime with 7.4.0.

  Add a standalone Taro Vue 3 retail source export for H5 and WeChat, preserving the default Wevu and existing uni-app choices. Share the Vue source converter and recursive native verifier rather than maintaining a second retail application. Pin the supported Webpack toolchain, restrict peer allowances and install hooks, and apply the upstream Swiper key-filter fix while documenting the remaining dependency advisories.

  Preserve accessible names when Taro hydrates its H5 input asynchronously, and keep fixed cart actions above the H5 tab bar using the compiler-supported height constant. Retain controlled inputs, stock limits, keyboard selection, address validation, integer-cent quotes and immutable simulated-order snapshots.

  Apply the selected everyday-catalog design to the live retail source: product-first browsing, warm paper surfaces, serif headings, readable controls and separated cart/order rows. Carry the same presentation through all three exports without changing the business services or implying real payment or fulfillment. Exercise native checkout through labelled controls instead of pinning card wrappers, placeholder wording or typography classes.

  Keep the documented brand accent effective on the catalog wordmark. Explicitly size padded full-width retail wrappers as border-box because the native source imports Tailwind utilities without preflight; strengthen only form-control boundaries while preserving quiet row separators.

  Normalize Taro SPA route parameters exactly once without mutating shared lifecycle options or changing native hooks, preserving the SDK's generic callback contract. Expose H5 button disabled state to assistive technology. Distinguish cart quantity from checkout selection. Let the existing inline error/retry channel own matching nonempty load errors instead of creating duplicate, obstructing toasts; retain toast feedback for errors the page does not represent.

- Add semantic form descriptions, checkbox mixed and readonly states, switch sizing and loading states, and shared motion tokens across H5, Weapp, and Registry components.

- Use white text for solid theme buttons across H5, Weapp, and Registry styles.

- Updated dependencies:
  - @varo-ui/headless@2.2.0
  - @varo-ui/theme@2.2.0

## 2.1.0

### Minor Changes

- Absorb HeroUI-inspired checkbox, collapse, tag, and breadcrumb motion, and use white foregrounds on WeChat green action fills.

### Patch Changes

- Upgrade Wevu 7 and weapp-vite 7 without pinning patch versions, restyle Weapp Agent UI status variants with class modifiers, add a private Web preview for compiled mini-program artifacts, and keep Weapp theme variables out of weapp-vite sidecar JavaScript wrappers.

- Ship wevu SFC Dialog parts without document listeners, keep the reason/cancel contract, and center Weapp Button labels when an icon is present.

- Give VIcon empty native string defaults, restyle toast as a dark mobile capsule, let input-number fill stretched parents without overflowing narrow tracks, animate collapse row tracks, and document Weapp breadcrumb href as select-only.

- Replace input-number ASCII steppers with named VIcon plus/minus controls and restore its compact inline geometry, pin textarea word-limit to the bottom-right, use a circular cancel-x on Input/Select without stretching Select on focus, avoid the native Input `focus` prop/handler collision, add dual-target multi-column Picker, DateField, PullRefresh, Signature, and Watermark Registry components while keeping Calendar independent, add shared motion tokens and Spectrum-inspired Button, Switch, Radio, Toast card, and VToastRegion interactions without changing the Varo palette, teach weapp-web native controls to preserve hover and ARIA semantics without Glass-Easel property warnings, pad docs API tables, preview compiled mini-program artifacts through weapp-web, and add a root `docs:dev` command with in-page H5 and Weapp primitive previews.

- Updated dependencies:
  - @varo-ui/headless@2.1.0
  - @varo-ui/theme@2.1.0

## 2.0.0

### Major Changes

- Replace the Select `searchable` prop with `filterable` and move local filtering into the Select field so the expanded panel no longer renders a second search input.

- Require the Wevu 7.0.4 and weapp-vite 7.0.4 toolchain, adopt the built-in weapp-tailwindcss 5.5.1 pipeline, and preserve typed editable components with native-safe nullable and union prop descriptors.

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

- Add the `@varo-ui/weapp/resolver` entry with `VaroResolver` for usage-driven discovery of editable Registry SFCs, including Pascal, camel, and kebab filename normalization without emitting unused component entries.

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
