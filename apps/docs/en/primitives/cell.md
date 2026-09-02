# Cell

List-row foundation for settings, details, links, and clickable information cells.

## Runtime ownership

H5 and Weapp adapters keep the same public API; keyboard and navigation details stay target-owned.

## Demo

<PrimitiveExample name="cell" locale="en" />

## Install

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# or
pnpm add @varo-ui/headless @varo-ui/weapp
```

## Why this is foundational

- Mobile products rely heavily on consistent information and settings rows.
- Title, description, icon, and link affordance keep one structure.

## Parts

| Part            | Role                                        |
| --------------- | ------------------------------------------- |
| `CellGroupRoot` | Group heading and container                 |
| `CellRoot`      | Title, content, description, and activation |

## State and events

- State：`clickable`, `isLink`, `to`, `size`, and `center`
- Events：`click`.

## Platform notes

H5 adds Enter/Space for clickable non-links; Weapp uses native tap.

## Related docs

- [Primitives overview](/en/primitives/)
- [Component docs](/en/components/button)
