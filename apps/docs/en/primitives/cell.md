# Cell

List-row foundation for settings, details, links, and clickable information cells.

## Runtime ownership

This page's Parts and interactive example are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu `VCell` / `VCellGroup` SFCs, with no Parts API equivalence; the native tab shows source/evidence only. Keyboard and navigation capabilities remain runtime-specific.

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
