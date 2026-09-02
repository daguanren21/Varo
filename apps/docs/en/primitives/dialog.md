# Dialog

Modal interaction foundation composed from Root, Trigger, Overlay, Content, and Close.

## Runtime ownership

`useDialogRoot` comes from `@varo-ui/headless`; H5/UI wrappers strengthen focus, portal, and motion.

## Demo

<PrimitiveExample name="dialog" locale="en" />

## Install

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# or
pnpm add @varo-ui/headless @varo-ui/weapp
```

## Why this is foundational

- Confirmation, approval, and high-risk actions need explicit entry and exit.
- Separate Overlay and Content adapt cleanly to each runtime.

## Parts

| Part            | Role                   |
| --------------- | ---------------------- |
| `DialogRoot`    | Open state and context |
| `DialogTrigger` | Open entry             |
| `DialogOverlay` | Overlay dismiss        |
| `DialogContent` | Modal content          |
| `DialogClose`   | Explicit exit          |

## State and events

- State：`open`, `defaultOpen`, and `disabled`
- Events：`update:open` and `openChange`.

## Platform notes

H5 supports Escape; Weapp uses explicit Close/overlay. Full focus trapping belongs to UI wrappers.

## Related docs

- [Primitives overview](/en/primitives/)
- [Component docs](/en/components/button)
