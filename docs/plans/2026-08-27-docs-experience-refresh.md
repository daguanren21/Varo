# Documentation Experience Refresh

## Brief

- Product type: expanding design-system documentation and editable Registry catalog
- Audience: Vue, H5, mini-program, design-system, and Agent UI engineers
- Primary job: understand Varo's cross-runtime contract, find the right asset, inspect both targets, and reach installable source quickly
- Primary action: search or navigate to a component family, then inspect its H5/Weapp behavior and code
- Current failures: the 10-item top navigation hides discovery controls; there is no documentation search or component overview; all sidebar categories start expanded; the global grid competes with long-form reading; demo radii/glows drift from the documentation token system; mobile homepage cards consume excessive vertical space; dark documentation styles leak into the intentionally light Agent demo table
- Scope: navigation, local search, sidebar defaults, homepage hierarchy, component overview pages, documentation typography/surfaces, shared interaction states, and demo framing
- Constraints: VitePress 2 alpha, Vue 3, bilingual routes, no new runtime dependency, preserve existing component APIs and H5/Weapp demo behavior
- Accessibility target: WCAG 2.2 AA
- Performance target: no new third-party runtime; provisional Core Web Vitals targets of LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1; local measurements remain lab evidence only
- Non-goals: rewrite every API page, redesign production package components, change Registry manifests, or add decorative animation

## Five-second clarity target

A first-time visitor should understand:

1. Varo provides reusable H5 and Weapp component infrastructure.
2. Components, primitives, Agent UI, and blocks are separate but connected asset layers.
3. Search, the component catalog, or installation gets them to usable source.

## Evidence questions

| Evidence class | Question | Source |
| --- | --- | --- |
| Real product flows | How do mature component libraries support search, catalog browsing, and deep component documentation? | TDesign Mobile Vue and shadcn/ui documentation |
| Patterns and principles | Which documentation capabilities should be prioritized for a growing design system? | Design System Checklist and the existing Varo product contract |
| Design systems and tokens | How can documentation and embedded demos share one visual language without hiding platform differences? | Existing Varo semantic tokens and VitePress theme structure |
| Components and motion | Which details need implementation changes after the shell is locked? | Existing VitePress controls and Varo demo components; no external component runtime |
| Quality standards | Is the result readable, keyboard accessible, responsive, stable, and fast? | WCAG 2.2 AA, ARIA APG, and current Core Web Vitals guidance |

## Reference Lock

### Primary direction

**Quiet technical canvas with teal signal.**

The interface should feel like a precise engineering workspace: calm neutral reading surfaces, restrained borders, compact navigation, and teal reserved for active state, focus, and cross-runtime identity.

Structural decisions:

1. Make search and component discovery first-class instead of exposing every destination in the top bar.
2. Keep the global grid out of long-form reading; retain a faint technical grid only in the homepage hero and intentionally framed demos.
3. Use readable content widths and compact, grouped directories instead of a wall of expanded navigation or repeated cards.

### Product and pattern evidence

| User problem | Reference observation | Decision | Rationale and scope |
| --- | --- | --- | --- |
| Finding 40+ components | TDesign exposes search, version/product context, a component overview, and grouped component families | Adapt | Add local search and a bilingual grouped catalog; use text cards rather than thumbnail assets that Varo does not have |
| Scanning a large library | shadcn/ui keeps high-level navigation compact and presents all components as a restrained multi-column directory | Adopt | Link “Components” to an overview and keep the directory dense, searchable, and deep-linkable |
| Growing a system safely | Design System Checklist prioritizes documented behavior, variants, accessibility, governance, and maintenance | Adopt | Preserve same-page H5/Weapp behavior demos and make states/foundations explicit rather than adding decorative catalog volume |
| Distinct cross-runtime identity | Existing Varo docs use teal and technical grid cues | Adapt | Keep teal and localized grid cues; remove global grid noise and excessive glow |
| Dark documentation around a light embedded product demo | Global documentation table styles leaked into Agent Markdown | Reject | Embedded component surfaces must own their internal theme and contrast |

### Selected details

1. Component-family cards show count, purpose, and representative links, improving orientation without adding images.
2. H5/Weapp segmented controls use a quiet selected surface and clear focus ring, replacing gradient glow while preserving platform state.

### Controlled experiment

None. Search, hierarchy, catalog structure, contrast, and responsive reading solve the observed problems without experimental interaction.

### Anti-references

- A sci-fi grid across every reading page: memorable on the hero, noisy across long documentation.
- Large rounded containers, nested card shells, and neon glow on routine controls: they create a second visual language and weaken hierarchy.
- A permanently expanded sidebar containing the whole library: it increases scan cost and makes mobile navigation unwieldy.

## System Decisions

- Color: neutral reading canvas; teal only for brand, active, link, and focus signals
- Typography: system-first sans stack, stronger title hierarchy, comfortable 65–76 character reading measure, balanced headings
- Spacing: compact shell and directories; generous separation only between semantic sections
- Shape: 6–12 px shell and control radii; larger radii only for deliberate device frames
- Shadow: border-first; shadows reserved for overlays and elevated previews
- Motion: 120–180 ms explicit color, border, opacity, and transform transitions; reduced-motion override retained
- Responsive: compact desktop nav, grouped mobile navigation, one-column catalogs below tablet widths, no hidden primary path

## Component Map

- `.vitepress/config.ts`: navigation, search, sidebar defaults, and bilingual route parity
- `.vitepress/theme/custom.css`: semantic docs tokens, shell, reading surface, directories, links, code, and responsive behavior
- `index.md` and `en/index.md`: homepage hierarchy and entry points
- `components/index.md` and `en/components/index.md`: bilingual grouped component discovery
- `PlatformTabsDemo.vue`: preserve script/data contracts; refine only scoped visual states and framing
- `AgentComponentsDemo.vue`: preserve stream behavior; isolate the light Agent table from dark docs styles

## State Inventory

| State | Required behavior | Verification |
| --- | --- | --- |
| Search closed/open/no result | visible trigger, keyboard access, localized labels, clear empty result | browser keyboard flow |
| Navigation desktop/mobile | primary routes visible or in one named menu; no overflow | desktop and 390 px viewport |
| Sidebar collapsed/active | categories collapsed by default; active route discoverable | component and AI routes |
| Links and controls | default, hover, active, focus-visible, disabled where applicable | keyboard and pointer checks |
| Theme | light and dark maintain contrast; embedded demos retain owned theme | screenshots and computed colors |
| Long/localized content | no clipping or horizontal document overflow | Chinese and English routes |
| Reduced motion | no information loss and near-instant decorative transitions | emulated media preference |

## Lock Review

- Every source answers a stated question.
- Complete discovery flows take priority over isolated visual references.
- One direction is named and anti-references prevent visual drift.
- Existing VitePress and Varo components remain the implementation foundation.
- Accessibility and performance targets are explicit.
- The implementation adds no external UI or motion runtime.

## Brand System Revision

### Selected territory

**Luminous Runtime / Kinetic Grid.** A woven 12-unit module system expresses components moving through runtime paths. Blue modules identify the H5 lane; mini-program green modules identify the Weapp lane; tonal depth belongs only to the richer app icon.

### Reference decisions

- Adopt Raycast's separation between logo, wordmark, and app icon, plus its disciplined repeated-unit construction.
- Adopt Linear's rule that the wordmark is primary when space allows and that brand assets need generous clear space.
- Adopt Base UI's ability to render the core glyph in one color without losing recognition.
- Reject literal `V` marks, folded teal ribbons, rounded-square badges around the logo, and decorative gradients in the primary signature.

### Platform color contract

- H5 lane: `#3B82F6` with highlight `#73A7FF`.
- Weapp lane: `#07C160` with depth `#059B4D`.
- The mark uses Weapp green as a platform cue without reproducing the WeChat logo or implying affiliation.
- The wordmark remains neutral ink/cream so platform colors stay semantic rather than decorative.

### Deliverables

- Path-only Kinetic Grid logomark.
- Path-only lowercase `varo` wordmark.
- Light and dark horizontal lockups.
- Rich dark app icon derived from the same module geometry.
- SVG favicon plus 16, 32, 48, 180, 256, and 1024 px raster assets.
