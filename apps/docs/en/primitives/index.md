# Primitives

Primitives are not another UI kit inventory. They are Varo runtime contracts for state, triggers, overlays, positioning, and dismiss behavior so H5 and mini-program wrappers share the same interaction semantics. Presentation components stay in the component docs; this section keeps the behavior building blocks.

<div class="varo-primitive-stack">
  <section>
    <span>01</span>
    <h2>Runtime contract</h2>
    <p>Root owns state and context, Trigger owns entry, Content/Overlay owns the visible layer, and Close owns exit. Platforms may change rendering details, not the contract.</p>
  </section>
  <section>
    <span>02</span>
    <h2>Composition order</h2>
    <p>Place Root first, then Trigger, then Overlay and Content. Stable composition keeps business blocks consistent across H5 and mini-programs.</p>
  </section>
  <section>
    <span>03</span>
    <h2>Controlled and uncontrolled</h2>
    <p>Use internal state for local UI. Switch to controlled mode when routing, analytics, or form coordination needs an external source of truth.</p>
  </section>
</div>

## Catalog

Browse the current 17 public primitives by capability. Every page includes an H5 live preview, a mini-program runtime contract, copyable code, and API reference.

<PrimitiveCatalog locale="en" />

## Next foundational candidates

More primitives are not automatically better. A behavior moves down only when state, keyboard/touch interaction, or dismiss logic would otherwise be repeated by several components.

| Candidate               | Enables                                       | Why it belongs below UI                        |
| ----------------------- | --------------------------------------------- | ---------------------------------------------- |
| `Tooltip`               | Tooltips, chart hints, truncated-copy help    | Delayed open, hover/focus, and dismiss policy  |
| `Menu` / `DropdownMenu` | Dropdown, context, and action menus           | Roving focus, arrow keys, and item activation  |
| `ToggleGroup`           | Segmented controls, formatting bars, filters  | Single/multiple selection and roving focus     |
| `Slider`                | Volume, range, and parameter controls         | Bounds, step, keyboard, and drag state         |
| `Combobox` / `Listbox`  | Search select, remote select, command palette | Input, filtering, active option, and selection |
| `Toast`                 | Global feedback, async results, undo          | Queue, lifecycle, pause, and dismiss behavior  |

Prioritize `Menu`, `Tooltip`, `ToggleGroup`, and `Slider`, then evaluate `Combobox` and `Toast`; their cross-runtime input models need explicit H5 and mini-program boundaries first.

## Product boundaries

- **Primitives** own behavior contracts: controlled/uncontrolled state, disabled rules, ARIA, `data-*` attributes, and dismiss events.
- **UI wrappers** own visuals and positioning: tokens, motion, icons, floating placement, and platform rendering details.
- **Business wrappers** own data and product policy: remote search, permissions, pagination, domain models, and copy.

This split keeps Base Kit source readable and editable. Teams can build their own UI packages on the same primitives without forking state machines.

## Authoring rules

- H5 and mini-program share the same part names and state model.
- Values inside one `TabsRoot` / `AccordionRoot` must stay unique.
- Mini-program docs never pretend a browser render is a real mini-program preview; they use a runtime contract table instead.
- Build custom product UI upward from primitives, or continue with the [component docs](/en/components/button) and the upcoming Blocks authoring guide.

## Related docs

- [Installation](/en/guide/installation)
- [Theme](/en/guide/theme)
- [Components](/en/components/button)
- [Examples](/en/examples/)
