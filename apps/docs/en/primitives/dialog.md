# Dialog

Modal interaction foundation composed from Root, Trigger, Overlay, Content, and Close.

## Runtime ownership

`useDialogRoot` comes from `@varo-ui/headless` and owns platform-neutral open requests, reasons, and synchronous cancellation. The H5 adapter owns focus trapping, background `inert`, and Trigger focus restoration; portal and motion stay in higher layers.

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

- State: `open`, `defaultOpen`, and `disabled`
- `onOpenChange(open, details)`: synchronous pre-change request callback
- Adapter events: `openChange(open, details)` fires first; `update:open(open)` follows only when the request is not canceled

```ts
type DialogOpenChangeReason
  = | 'trigger-press'
    | 'outside-press'
    | 'escape-key'
    | 'close-press'
    | 'imperative-action'

interface DialogOpenChangeDetails {
  readonly reason: DialogOpenChangeReason
  readonly canceled: boolean
  cancel: () => void
}
```

| `reason`            | Source                                   |
| ------------------- | ---------------------------------------- |
| `trigger-press`     | Trigger and `events.open()` / `toggle()` |
| `outside-press`     | Overlay / `events.onOverlayClick()`      |
| `escape-key`        | H5 Escape / `events.onEscapeKeyDown()`   |
| `close-press`       | Close / `events.close()`                 |
| `imperative-action` | Default for `api.setOpen()`              |

Cancellation must happen synchronously before the callback returns:

```ts
import type { DialogOpenChangeDetails } from '@varo-ui/headless'
import { useDialogRoot } from '@varo-ui/headless'

const hasUnsavedChanges = true

const dialog = useDialogRoot({
  defaultOpen: true,
  onOpenChange(nextOpen: boolean, details: DialogOpenChangeDetails) {
    if (!nextOpen && hasUnsavedChanges) {
      details.cancel()
    }
  }
})
```

After cancellation, uncontrolled state is not written and adapters do not emit `update:open`. When `open` is provided, that prop remains authoritative: an allowed request changes visibility only after the parent applies the next prop. If the parent changes the prop independently after a canceled request, the component still follows the prop.

## Platform notes

The H5 adapter supports overlay close, Escape, focus trapping, background `inert`, and Trigger focus restoration. The native WeChat mini-program runtime has no browser `document` keyboard events or DOM focus/inert/portal semantics, so native Weapp uses explicit Close and overlay paths. The repository's current Vue-modeled Weapp adapter maps Escape to `escape-key` when it runs on a browser/test surface with `document`; that modeled behavior does not promise keyboard or DOM focus capabilities in native WeChat. The reason/cancel state contract remains the same on both surfaces.

## Related docs

- [Primitives overview](/en/primitives/)
- [Component docs](/en/components/button)
