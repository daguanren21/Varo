# Agent Docs UI Acceptance

## Verification context

- Route: `/ai/`
- Reference lock: `docs/plans/agent-docs-visual-polish.md`
- Desktop target: Chromium, 1496 × 846 viewport
- Narrow target: Chromium, 390 × 844 viewport
- Accessibility target: WCAG 2.2 AA-equivalent web behavior

## Acceptance

- [x] Tailwind padding and margin utilities override the VitePress reset as authored.
- [x] Recommendation, task, artifact, source, attachment, reasoning, and composer surfaces have consistent interior spacing.
- [x] Conversation and context rail preserve an intentional desktop hierarchy.
- [x] Narrow layout stacks in reading order with no horizontal overflow, clipping, or hidden primary actions.
- [x] Code and Markdown use intentional scroll/wrap behavior and retain padded headers/bodies.
- [x] Dark cards expose readable labels and actions in default, hover, and focus-visible states.
- [x] Keyboard focus is visible and reduced motion preserves all information.
- [x] Agent docs tests and production build pass.

## Findings

| Severity | Surface                              | Evidence                                                                                                                                            | Resolution                                                                                           |
| -------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Blocker  | Agent component cards                | Browser computed styles: `.p-4` matched but resolved to `0px` because the unlayered VitePress universal reset outranked layered Tailwind utilities. | Imported Tailwind utilities outside the CSS layer; `.p-4` now resolves to `16px`.                    |
| High     | Context rail and artifact/code cards | User screenshot: copy and controls touched edges; dark labels lost contrast.                                                                        | Restored authored utility padding, explicit hero contrast, and visible focus treatment.              |
| High     | Conversation content                 | User screenshot: Markdown/artifact content clipped and overlapped at the transcript boundary.                                                       | Added zero-min-width grid boundaries and retained intentional table/code overflow.                   |
| Medium   | Narrow layout                        | Dense two-column composition could not retain desktop spacing at mobile widths.                                                                     | Stacked the workspace at 760 px, preserved 14–16 px interiors, and verified 390 px without overflow. |
