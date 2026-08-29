# Agent Docs Visual Polish

## Brief

- Audience: engineers evaluating Varo Agent UI across H5 and WeChat mini programs.
- Primary job: understand the event flow, inspect runtime state, and identify installable components without visual ambiguity.
- Five-second target: conversation on the left, factual run context on the right, one clear composer action.
- Current blockers: utility padding is overridden by VitePress reset CSS; cards touch their content; dark surfaces lose actions; long Markdown and code clip at narrow widths.
- Non-goals: new component APIs, new animation dependencies, decorative gradients, or a second theme.

## Direction: Calm Technical Workbench

A restrained teal-and-slate workspace. Clear nested surfaces, 16–24 px interior spacing, compact factual labels, and consistent 16–20 px radii. Density comes from structure, not from removing breathing room.

Structural decisions:

1. Conversation and context remain a 3:2 desktop split; narrow screens stack in reading order.
2. Every card owns visible internal padding; only deliberate code bodies may run edge-to-edge beneath a padded header.
3. Section spacing follows an 8 px grid: 8, 12, 16, 20, 24, 32.

Anti-references:

- Text or actions touching card edges.
- Random pills, radii, shadows, and gradients per component.
- Dark-on-dark action labels or clipped code/Markdown used as visual decoration.

## Evidence lock

| Reference                                                                           | Problem and observed pattern                                                                                                          | Decision                                                                                | Scope                            | Risk                                     |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------- |
| [Vercel AI Elements](https://elements.ai-sdk.dev/)                                  | Mature AI workspaces compose conversation, reasoning, task, source, and artifact surfaces while retaining clear component boundaries. | Adapt: preserve composability and factual state hierarchy; retain Varo tokens and copy. | Demo workspace and context rail. | Do not import a second component system. |
| [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) | Requires resilient overflow, visible focus, semantic actions, content extremes, and reduced motion.                                   | Adopt: apply to composer, cards, code, Markdown, and narrow layouts.                    | Interaction and acceptance.      | Browser checks are still required.       |
| Existing Varo teal/slate system                                                     | Already establishes product identity and H5/Weapp continuity.                                                                         | Adopt unchanged; repair spacing and contrast instead of restyling the brand.            | All Agent docs surfaces.         | Preserve public component behavior.      |

## Implementation constraints

- Fix the Tailwind/VitePress cascade once; do not hand-patch every missing `p-*` utility.
- Keep Vue render components and existing event/state contracts.
- Use scoped demo overrides only for composition-specific spacing and overflow.
- Motion remains transform/opacity only and honors reduced motion.
