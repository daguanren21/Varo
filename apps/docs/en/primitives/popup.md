# Popup

Popup foundation combining overlay, placement, close behavior, safe area, and destroy policy.

## Runtime ownership

`usePopupRoot` comes from `@varo-ui/headless`; H5 and Weapp implement placement and safe area separately.

## Demo

<PrimitiveExample name="popup" locale="en" />

## Install

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# or
pnpm add @varo-ui/headless @varo-ui/weapp
```

## Why this is foundational

- Bottom sheets, drawers, and action panels share one visible contract.
- Decoupled position and overlay support more UI wrappers.

## Parts

| Part        | Role                                               |
| ----------- | -------------------------------------------------- |
| `PopupRoot` | Visibility, overlay, content, close, and placement |

## State and events

- State：`visible`, `position`, `overlay`, `closeable`, `round`, and `destroyOnClose`
- Events：`update:visible`, `visibleChange`, `close`, and `clickOverlay`.

## Platform notes

Weapp safe area and H5 viewport adapt separately while public state stays aligned.

## Related docs

- [Primitives overview](/en/primitives/)
- [Component docs](/en/components/button)
