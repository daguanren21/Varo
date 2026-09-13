# Cell

List-row foundation for settings, details, links, and clickable information cells.

## Runtime ownership

H5 and Weapp adapters keep the same public API; keyboard and navigation details stay target-owned.

## Demo

<PrimitiveExample name="cell" locale="en" />

## Parts

| Part            | Role                                        |
| --------------- | ------------------------------------------- |
| `CellGroupRoot` | Group heading and container                 |
| `CellRoot`      | Title, content, description, and activation |

## State and events

- State：`clickable`, `isLink`, `to`, `size`, and `center`
- Events：`click`.

::: info Platform notes
H5 adds Enter/Space for clickable non-links; Weapp uses native tap.
:::
