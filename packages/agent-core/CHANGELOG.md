# @varo-ui/ai

## 3.0.0

### Major Changes

- Replace the private Agent event protocol, SSE transport, and stream controller with direct TanStack AI / AG-UI consumption. Registry Agent renderers and Blocks now accept TanStack ChatClientSnapshot; applications own the ChatClient and interrupt resolution. Keep Markdown, text presentation pacing, and thread-version helpers in @varo-ui/ai. Upgrade the native compiler and Wevu to 7.11.1 and use the published Web API runtime for standard streaming Fetch and cancellation.

  Keep trusted native-preview host bindings in an outer lexical scope so compiler-provided Web API declarations can shadow them without duplicate-binding parse failures.

  The historical 7.10.0 native slot integration was verified with execution-slot parent reactivity and child events, cancelable Dialog composition, Menu selection, and form-array runtime scenarios. Remove stale documentation claiming that plain-slot context is still blocked upstream, while retaining explicit opt-in and host/device evidence boundaries.

  Remove obsolete management-chunk relocation after the historical 7.10.0 compiler bundled those helpers into page/shared chunks. Validate actual emitted synchronous script dependencies and package ownership instead of requiring removed standalone files; keep native page, style, asset and package-size gates.

  Upgrade the native E2E automator to stable `@weapp-vite/miniprogram-automator` 1.5.5, including upstream PR1351. The four unchanged Launcher regressions now pass within 15/15 runner checks. Fresh compiler/Wevu 7.11.1 artifacts pass 110 native delivery contracts and all 92 native headless E2E cases, recovering the previous 22 failures without weakening assertions; all seven compiler profiles, Realworld, and the standalone retail starter also pass their artifact checks. IDE and device acceptance remain separate.

  Let comparison applications supply confirmed completion/cancellation outcomes independently of the TanStack ready state, preserving truthful result labels and side-specific stop/retry behavior.

  Preserve SDK message parts and historical tool receipts, keep failed tool states authoritative, and surface interrupt validation/transport errors with application-owned resubmission, retry, and cancellation. Bind approval intents to the rendered interrupt transaction, validate edited mall tool arguments before execution, complete documentation tool-result events, and preserve CommonJS parameters inside the native-preview isolation wrapper.

  Keep native approval controls scoped to keyed WXML list items so replaced transactions cannot reuse captured identities, and derive cancellation availability from serializable SDK metadata rather than methods removed by native property transport.

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

- Upgrade compatible Vue, Weapp, Markdown and build dependencies. Migrate Vitest 5 configuration discovery and vite-plugin-dts 5 declaration bundling, keeping published H5 type entrypoints self-contained without changing component implementations.

## 2.1.0

## 2.0.0

### Patch Changes

- Add immutable Agent thread branching, scoped context permissions, visible retrieval receipts, task controls, thread versions, placement shells, and the dual-target Agent Workspace Block.

- Terminate Agent stream connections on protocol terminal events, validate Registry manifests at install time, and roll back partial Registry file writes.

## 1.2.0

## 1.1.0

## 1.0.1

### Patch Changes

- Add package READMEs and tree-shakeable module entries.

## 1.0.0

### Major Changes

- Initial stable release of the Varo cross-runtime component system.
