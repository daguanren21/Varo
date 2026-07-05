# Varo Shadcn-Style Base Design

## Summary

Varo should move from a traditional packaged mobile component library to a shadcn-style cross-platform base system. The product surface becomes:

- app bases that scaffold real projects
- a source-code registry for components, utilities, hooks, and templates
- a maintained Varo component library built on top of the base
- a blocks registry for production-shaped screens and page sections
- runtime packages that provide primitives, theme, adapters, and tested shared behavior

The first platform set is H5 and `weapp-vite`. `weapp-vite` is the only mini-program/App runtime target for this design. Uni-app, Taro, Capacitor, React Native, and other App runtimes are out of scope.

## Product Positioning

Varo should be documented as a cross-platform shadcn-style base for Vue teams that need H5 and mini-program delivery. It should not be positioned mainly as a black-box npm UI library.

The npm packages remain important, but their role changes:

- `@varo/primitives-core` supplies shared interaction state and controlled/uncontrolled contracts.
- `@varo/primitives-h5` and `@varo/primitives-weapp` adapt primitives to platform render targets.
- `@varo/theme` supplies tokens, CSS variables, and platform-friendly theme output.
- `@varo/ui-h5` and `@varo/ui-weapp` provide official maintained runtime wrappers.
- registry entries copy source code into a consumer project, shadcn-style.

The registry becomes the primary developer experience. Users should be able to inspect, copy, change, and own their components.

## User Stories

1. As an H5 developer, I can initialize a Varo H5 base with Vue, Vite, Tailwind-compatible styling, theme tokens, utilities, and local component folders.
2. As a mini-program developer, I can initialize a Varo `weapp-vite` base with `weapp-vite`, `weapp-tailwindcss`, `wevu`, theme tokens, utilities, and local component folders.
3. As a design-system maintainer, I can use Varo primitives and theme tokens to maintain a company-owned component library without forking the runtime packages.
4. As a product engineer, I can add a component from the registry and receive source files, dependencies, imports, styles, tests, and documentation links.
5. As a product engineer, I can add a block such as login, profile, product list, order card, or settings page and receive all required component dependencies.
6. As a docs reader, I can understand the base, registry, components, blocks, primitives, and theme in that order.
7. As a maintainer, I can evolve H5 and `weapp-vite` implementations separately when the platform requires it, while keeping the public component contract aligned.

## Design Principles

- Registry first: copied source is the main product experience.
- Runtime packages second: packages provide stable foundations, not opaque ownership of every UI decision.
- Platform differences stay in adapters, templates, and per-platform registry files.
- Component APIs should feel familiar to mobile Vue users, with reference points from NutUI, TDesign, and Vant.
- Blocks must be built from registry components and project utilities, not one-off demo markup.
- Documentation should teach workflows first, then reference details.
- The first release should prefer a complete narrow path over a broad incomplete catalog.

## Architecture

### Existing Package Roles

The current package boundaries are a good base and should be preserved.

`packages/primitives-core` remains the shared logic layer. It should contain platform-independent state, controlled state helpers, overlay/dialog/popup contracts, field contracts, and other interaction primitives.

`packages/primitives-h5` and `packages/primitives-weapp` remain platform primitive packages. They should expose hooks and low-level parts for H5 and `weapp-vite`.

`packages/theme` becomes the shared token engine. It should grow beyond button/dialog/input and cover the component families that Varo intends to ship.

`packages/ui-h5` and `packages/ui-weapp` remain official runtime UI wrappers. Their code should become thinner over time by extracting shared props, variants, token mapping, and component contracts.

`packages/shared`, `packages/hooks`, and `packages/utils` continue to hold cross-package helpers when the helper is useful outside a copied registry component.

### New Product Areas

Add a registry area:

```text
registry/
  components/
    button/
      registry.json
      h5/
      weapp/
    input/
    cell/
    dialog/
    popup/
    form/
  blocks/
    login-form/
    profile-card/
    product-list/
  hooks/
  utils/
  themes/
  templates/
    h5/
    weapp-vite/
```

The exact physical layout can be adjusted during implementation, but registry entries need to represent these concepts:

- `component`: a reusable UI component
- `block`: a composed UI section or screen
- `hook`: copied composable logic
- `util`: copied utility code
- `theme`: copied token or CSS variable preset
- `template`: project base files

### Platform Targets

Use two first-class targets:

- `h5`
- `weapp-vite`

The previous phrase "App" should be interpreted as the `weapp-vite` app base for this phase. No separate native or hybrid App runtime is included.

Each registry item declares target support:

```json
{
  "targets": ["h5", "weapp-vite"]
}
```

An item can support only one target if the implementation is not portable.

## Registry Contract

Each registry item should describe:

- name
- type
- title
- description
- targets
- files to copy
- registry dependencies
- npm package dependencies
- dev dependencies when needed
- aliases or import rewrites
- docs route
- source package dependency when a file imports Varo runtime packages

Example shape:

```json
{
  "name": "button",
  "type": "component",
  "title": "Button",
  "description": "A mobile-first action component with variants, sizes, loading state, and platform-specific rendering.",
  "targets": ["h5", "weapp-vite"],
  "dependencies": ["@varo/theme"],
  "registryDependencies": ["utils/cn"],
  "files": [
    {
      "target": "h5",
      "from": "registry/components/button/h5/VButton.ts",
      "to": "src/components/ui/button.ts"
    },
    {
      "target": "weapp-vite",
      "from": "registry/components/button/weapp/VButton.ts",
      "to": "src/components/ui/button.ts"
    }
  ],
  "docs": "/components/button"
}
```

The schema should be validated in tests before any CLI or docs automation depends on it.

## Base Templates

### H5 Base

The H5 base should include:

- Vue 3
- Vite
- TypeScript
- Tailwind-compatible utility setup
- Varo theme setup
- `src/components/ui`
- `src/components/blocks`
- `src/lib`
- example route or demo entry
- deterministic typecheck/build/test scripts

### Weapp-Vite Base

The `weapp-vite` base should include:

- Vue 3
- `weapp-vite`
- `wevu`
- `weapp-tailwindcss`
- TypeScript
- Varo theme setup
- mini-program app entry files required by `weapp-vite`
- `src/components/ui`
- `src/components/blocks`
- `src/lib`
- deterministic typecheck/build/test scripts

The template should keep weapp-specific constraints explicit: file output shape, style extraction, runtime component compatibility, and unsupported browser-only APIs.

## Component Library Direction

Varo's own component library should be built as a curated registry plus official runtime wrappers.

The API should reference:

- NutUI for mobile scenario coverage and mini-program expectations
- TDesign for API consistency, token discipline, and enterprise usage
- Vant for mobile Vue ergonomics and concise props

The first components to normalize for the new direction:

1. Button
2. Cell
3. Input
4. Form
5. Dialog
6. Popup
7. Overlay
8. Picker
9. Cascader
10. Calendar

The first implementation wave should not attempt to rewrite every existing component. It should prove the registry and template loop with a smaller set, then expand.

## Blocks Direction

Blocks are production-shaped compositions that users copy into their app. They should be organized by use case rather than component category.

First block set:

- `login-form`: mobile login form using Input, Button, Form, and Cell conventions
- `profile-card`: user profile header/card using Image, Cell, Button, and theme tokens
- `product-list`: product list/card composition using Image, Cell, Button, Grid or Layout

Each block should declare dependencies on registry components. Installing a block should resolve and copy required components and utilities.

Blocks should have H5 and `weapp-vite` variants when platform markup differs. Shared logic can live in copied hooks or imported Varo runtime helpers.

## Documentation IA

The docs should be reorganized around user workflows:

1. Getting Started
   - What is Varo
   - H5 base
   - Weapp-vite base
   - Project structure
2. Registry
   - How copied components work
   - Registry item schema
   - Installing components
   - Customizing generated code
3. Components
   - Button
   - Cell
   - Input
   - Form
   - Dialog
   - Popup
   - Other current components
4. Blocks
   - Login
   - Profile
   - Product
5. Theme
   - Tokens
   - CSS variables
   - Component tokens
   - H5 and weapp-vite differences
6. Primitives
   - Controlled state
   - Overlay/Dialog/Popup
   - Field/Form
7. Reference
   - Runtime packages
   - Migration notes
   - Contributing

The current installation page must be updated because it still documents old `wevu` version guidance. Future docs should avoid pinning runtime versions in prose when package metadata already defines them, unless the page is explicitly about compatibility.

## Code Optimization Direction

Component optimization should happen after the registry and base contracts are clear.

The main optimization target is duplicate H5/weapp wrapper code. Current components such as Button have near-identical H5 and weapp implementation. Shared component contracts should be extracted into platform-neutral modules where practical:

- prop types
- variant types
- class or token builders
- slot/content helpers that do not depend on DOM or mini-program specifics
- theme mapping

Platform-specific files should keep:

- render target selection
- native element or weapp component differences
- event normalization
- style and class output quirks
- unsupported API guards

This keeps copied registry code readable without forcing a single implementation onto incompatible platforms.

## Testing Strategy

Add tests in the order dependencies appear:

1. Registry schema validation tests.
2. Template smoke tests for H5 and `weapp-vite`.
3. Component registry dependency resolution tests.
4. Runtime component tests for first-wave components.
5. Docs navigation and content tests for new sections.
6. Build and typecheck across existing packages.

The first implementation milestone is complete only when these commands pass:

```bash
pnpm typecheck
pnpm test
pnpm build
```

When template projects become executable in CI, add per-template smoke commands.

## Phased Implementation

### Phase 1: Direction and Docs Foundation

- Create the formal design spec.
- Update docs positioning and navigation.
- Fix installation docs to match current dependencies and the new base/registry direction.
- Add high-level docs pages for Base, Registry, and Blocks.

### Phase 2: Registry Schema and Minimal Entries

- Add registry schema and validation tests.
- Add component entries for Button, Cell, Input, Dialog, Popup, and Form.
- Add utility entry for a class name helper if needed.
- Add theme entry for base tokens.

### Phase 3: Base Templates

- Add H5 template.
- Add `weapp-vite` template.
- Add template smoke tests.
- Document project structure and customization points.

### Phase 4: First Blocks

- Add Login Form block.
- Add Profile Card block.
- Add Product List block.
- Ensure block dependencies resolve through registry metadata.
- Add docs pages with H5 and `weapp-vite` previews or code tabs.

### Phase 5: Component Code Optimization

- Extract duplicated cross-platform component contracts.
- Normalize first-wave component APIs against NutUI, TDesign, and Vant references.
- Keep behavior compatible with current tests unless the docs explicitly define a breaking change.

## Non-Goals

- Building a generic multi-runtime App solution.
- Adding uni-app, Taro, Capacitor, or React Native support.
- Rewriting all current components before registry foundations exist.
- Replacing existing primitives packages.
- Making blocks depend on private undocumented implementation details.
- Shipping a visual builder.

## Success Criteria

The new direction is successful when:

- docs clearly present Varo as a shadcn-style H5 and `weapp-vite` base
- at least one H5 base and one `weapp-vite` base can be created or copied from templates
- registry metadata can be validated deterministically
- first-wave components can be copied with their dependencies
- first-wave blocks can be copied with their component dependencies
- existing package typecheck, tests, and build remain green

## References

- shadcn registry documentation: https://ui.shadcn.com/docs/registry
- shadcn blocks documentation: https://ui.shadcn.com/docs/blocks
- shadcnblocks examples: https://www.shadcnblocks.com/
- NutUI: https://nutui.jd.com/
- TDesign: https://tdesign.tencent.com/
- Vant: https://vant-ui.github.io/vant/
