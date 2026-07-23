# Primitives Documentation And Block Authoring Design

**Date:** 2026-07-10  
**Status:** Approved for implementation planning

## Context

The current Primitives overview combines a catalog, a large multi-component interaction demo, implementation guidance, platform differences, and architecture commentary on one page. The result is difficult to scan and does not give developers a clear path from discovering a primitive to copying a working example or understanding its API.

The documentation also explains how to install existing registry blocks, but it does not teach developers how to design, build, test, maintain, and optionally contribute their own blocks.

The new documentation will follow the information architecture used by mature open-source primitive libraries: overview pages support discovery, while one component page explains one primitive in depth. The presentation must remain part of the current Varo VitePress theme rather than introducing a separate visual system.

## User Stories

### Primitive discovery

- As a developer, I want to scan the available primitives by category so that I can find the correct behavioral building block quickly.
- As a developer, I want each primitive to have a dedicated page so that examples, parts, APIs, accessibility behavior, and platform differences are not mixed with unrelated components.
- As an H5 developer, I want a real interactive preview and copyable H5 code so that I can validate behavior before integrating it.
- As a Weapp developer, I want accurate Weapp code and platform notes so that the documentation does not imply browser-only behavior exists in a mini-program runtime.
- As a bilingual reader, I want the Chinese and English navigation and page structures to match.

### Block authoring

- As an application developer, I want an end-to-end guide for building a local block from Base Kit components so that I can create maintainable product UI without modifying Varo internals.
- As an application developer, I want clear ownership boundaries between primitives, Base Kit, business wrappers, and blocks so that product-specific behavior is placed in the correct layer.
- As a block author, I want a verification checklist so that my block has deterministic type, test, build, and install checks.
- As a contributor, I want an optional registry contribution path so that a reusable local block can be prepared for inclusion in Varo without exposing private product information.

## Goals

1. Replace the current multi-component Primitives interaction showcase with a discoverable catalog and dedicated P0/P1 primitive pages.
2. Remove the `Reka-style anatomy` heading and associated narrative from the public documentation and demo copy.
3. Add consistent Chinese and English documentation for Checkbox, Radio Group, Switch, Tabs, Select, Collapsible, Accordion, and Popover.
4. Provide an accurate H5/Weapp reading path without simulating mini-program runtime behavior in a browser.
5. Add a complete guide for developing a local block and optionally contributing it to the Varo registry.
6. Preserve the existing Varo VitePress theme, navigation shell, density, and responsive behavior.

## Non-Goals

- Redesigning the VitePress navigation shell or the global Varo documentation theme.
- Adding new primitive runtime behavior or changing public primitive APIs.
- Building a browser emulator for Weapp components.
- Documenting every existing legacy primitive in this iteration.
- Adding a publishing service, registry administration UI, or automatic contribution workflow.
- Embedding real product APIs, credentials, private URLs, internal task identifiers, or private domain models in examples.

## Information Architecture

### Chinese routes

```text
/primitives/
/primitives/checkbox
/primitives/radio-group
/primitives/switch
/primitives/tabs
/primitives/select
/primitives/collapsible
/primitives/accordion
/primitives/popover
/blocks/build-your-own
/blocks/profile-edit
/blocks/order-filter
```

### English routes

```text
/en/primitives/
/en/primitives/checkbox
/en/primitives/radio-group
/en/primitives/switch
/en/primitives/tabs
/en/primitives/select
/en/primitives/collapsible
/en/primitives/accordion
/en/primitives/popover
/en/blocks/build-your-own
/en/blocks/profile-edit
/en/blocks/order-filter
```

The VitePress sidebar will list the Primitives overview followed by the eight dedicated pages. The Blocks group will list the authoring guide before the existing block examples.

## Primitives Overview

The overview remains an architectural introduction and discovery surface. It will:

- retain a concise explanation of primitives as cross-runtime behavior contracts;
- keep the current Varo page shell and theme;
- group links into `Controls` and `Disclosure & Floating`;
- show one short capability description per primitive;
- link each supported primitive to its dedicated page;
- retain only architecture guidance that applies across all primitives.

The overview will not contain live component demos, detailed API prose, component-specific keyboard behavior, or the `Reka-style anatomy` section.

## Primitive Page Contract

Every dedicated primitive page uses the same section order:

1. Name and one-sentence purpose.
2. Runtime availability and active package name.
3. H5/Weapp platform selector.
4. Preview/Code example surface.
5. Installation.
6. Basic usage.
7. Additional scenarios when applicable.
8. Parts.
9. Props, events, and data attributes.
10. Accessibility.
11. Platform notes.
12. Link to the custom Block authoring guide.

The consistent order lets readers move between primitives without relearning the documentation structure.

### Example scope by primitive

| Primitive | Basic example | Additional scenarios |
| --- | --- | --- |
| Checkbox | checked and indicator | controlled, disabled |
| Radio Group | select one item | controlled, disabled item |
| Switch | checked and thumb | loading, disabled |
| Tabs | automatic horizontal tabs | controlled, disabled, vertical, manual activation |
| Select | trigger, value, content, item | controlled, groups, disabled item, placeholder |
| Collapsible | trigger and content | controlled, disabled |
| Accordion | single collapsible item | multiple, disabled item |
| Popover | trigger, content, close | controlled, Escape/outside interaction, Weapp dismiss pattern |

## Platform Presentation

The platform selector changes package names, code examples, data attributes, and platform notes.

### H5

- The documentation renders a real interactive preview using `@varo/primitives-h5`.
- Preview and Code are two views of the same example.
- Accessibility and keyboard examples describe and demonstrate browser behavior.

### Weapp

- The documentation shows copyable `@varo/primitives-weapp` code and the corresponding state contract.
- Platform notes explain differences in focus, keyboard handling, document-level events, overlays, and dismiss behavior.
- The page must not label a browser-rendered custom element as a real mini-program preview.
- The Preview view is replaced by a compact `Runtime Contract` table that lists relevant state, emitted events, data attributes, and platform-specific behavior. It is clearly labeled as documentation rather than runtime output.

## Shared Documentation UI

The implementation will introduce two focused docs-only components to remove duplication:

- `PrimitiveExample`: owns the H5/Weapp and Preview/Code controls, package label, copy action, and example slots.
- `PrimitiveCatalog`: renders the categorized overview links using the existing documentation theme.

These components are documentation infrastructure only. Primitive API content remains in Markdown so it is searchable, linkable, and readable without executing client-side JavaScript.

Copy actions must expose visible success feedback without changing layout. Platform and view controls must use semantic buttons or tabs, support keyboard operation, and retain stable dimensions.

## Theme Integration

The pages must use the existing VitePress structure and theme variables:

- `--vp-sidebar-width`, `--vp-aside-width`, and `--vp-content-container` for layout;
- `--varo-bg`, `--varo-surface`, and `--varo-card-*` for surfaces;
- `--varo-foreground` and `--varo-muted` for text;
- `--varo-border` and `--varo-border-strong` for structure;
- `--varo-accent` and `--varo-accent-soft` for active controls;
- `--varo-radius` and `--varo-radius-lg` for 6-8px radii;
- existing shadows, grid background, typeface, and light/dark modes.

The new pages must not introduce a separate palette, oversized marketing typography, decorative nested cards, or a second navigation system. Tables, code blocks, borders, and restrained tool controls should carry the information hierarchy.

## Custom Block Authoring Guide

The guide will use an anonymized filter block as the running example. The example must not contain real APIs, credentials, private URLs, internal requirement identifiers, or product-specific domain records.

### Guide structure

1. **Understand the layers**
   - primitives own state, events, parts, and runtime semantics;
   - Base Kit owns copied low-level UI source;
   - business wrappers own APIs, permissions, field mapping, and product copy;
   - blocks own reusable screen sections and local composition.
2. **Define the block contract**
   - inputs, emitted events, local state, dependencies, and excluded business concerns.
3. **Choose Base Kit dependencies**
   - prefer `src/components/ui/*` dependencies over importing registry source directly;
   - keep remote data and product policy outside the block.
4. **Create the local block**
   - place source in `src/components/blocks/*`;
   - use typed props and emits;
   - compose a small, readable layout.
5. **Test the block**
   - cover render state, user interaction, emitted values, disabled behavior, and dependency boundaries.
6. **Use and maintain it locally**
   - import from the local block path;
   - explain that copied source belongs to the application and can be modified.
7. **Prepare registry metadata**
   - create `registry/blocks/<name>/registry.json`;
   - declare `type`, `name`, `description`, `targets`, `registryDependencies`, file mappings, and docs route.
8. **Add bilingual documentation**
   - describe the block purpose, dependencies, target, file destination, and customization boundary.
9. **Verify installation**
   - run deterministic project checks;
   - pack the CLI and install the block in a temporary fixture;
   - confirm recursive dependencies, no-clobber behavior, and explicit force behavior.
10. **Contribute to Varo**
    - run the privacy and portability checklist;
    - submit source, metadata, tests, and bilingual docs together.

### Troubleshooting

The guide will include focused remedies for:

- a missing or misspelled `registryDependency`;
- a destination path that conflicts with an existing local file;
- product-specific logic leaking into a reusable block;
- H5-only APIs appearing in shared or Weapp examples;
- a block that passes unit tests but fails packed CLI installation.

## Migration

- Remove `PrimitiveInteractionDemo` from the Primitives Markdown pages and VitePress global component registration.
- Remove its source file if no other page imports it.
- Remove public text and tests that require `Reka-style anatomy`.
- Preserve primitive implementation tests; only documentation-specific expectations should change.
- Convert overview table entries for the eight documented primitives into clear links.
- Add links from existing block pages to the authoring guide.

## Accessibility And Responsive Behavior

- Platform and Preview/Code controls must be keyboard operable and expose selected state.
- Copy actions require accessible names and non-layout-shifting success feedback.
- Interactive H5 examples must retain each primitive's documented keyboard behavior.
- Desktop layouts use the existing VitePress sidebar and outline.
- On narrow viewports, example toolbars may wrap, but controls and labels must not overlap or resize the example surface unexpectedly.
- Tables may scroll horizontally when necessary; text must remain readable without reducing font size based on viewport width.

## Verification

### Automated checks

- Navigation tests assert all Chinese and English routes and sidebar entries.
- Content tests assert the required section contract on each primitive page.
- Documentation component tests cover platform selection, Preview/Code selection, copy feedback, keyboard interaction, and stable rendering.
- Block guide tests assert required commands, paths, registry fields, dependency guidance, and privacy constraints.
- Existing project typecheck, test, and build tasks must pass.
- `git diff --check` must pass.

### CLI verification

- Build and pack `@varo/cli`.
- Install the guide's anonymized block or an existing representative block into a temporary fixture.
- Confirm recursive dependency installation.
- Confirm a second install refuses to overwrite existing files.
- Confirm explicit `--force` succeeds.

### Browser verification

- Verify overview and detail pages in light and dark modes.
- Verify desktop and mobile viewport layouts.
- Exercise H5 examples and both selector controls.
- Confirm code blocks, tables, sidebar navigation, and the right-hand outline remain readable and do not overlap.
- Close browser automation sessions after verification.

## Acceptance Criteria

1. The public Primitives overview no longer contains the multi-component interaction showcase or `Reka-style anatomy` content.
2. All eight P0/P1 primitives have matching Chinese and English detail pages and sidebar entries.
3. Every primitive page follows the documented section order and distinguishes H5 runtime preview from Weapp documentation.
4. The new pages visually inherit the current Varo theme in light and dark modes.
5. The Blocks section contains an end-to-end local authoring guide and an optional registry contribution path.
6. Examples and contribution guidance contain no private or product-specific information.
7. Documentation tests, typecheck, build, packed CLI verification, and responsive browser QA pass.
