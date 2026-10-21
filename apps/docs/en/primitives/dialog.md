# Dialog

Compose a modal dialog from Root, Trigger, Overlay, Content, and Close.

## Runtime ownership

`useDialogRoot` from `@varo-ui/headless` manages platform-neutral open and close requests, reasons, and synchronous cancellation. The H5 adapter handles focus trapping, background `inert`, and restoring focus to Trigger. Higher layers handle portals and animation.

Parts and interactive examples on this page come only from `@varo-ui/h5/primitives`. Native consumers use separate Wevu SFCs. The native tab shows source and support evidence, without a Vue Parts preview.

## Demo

<PrimitiveExample name="dialog" locale="en" />

## Parts

| Part            | Role                                    |
| --------------- | --------------------------------------- |
| `DialogRoot`    | Manages open state and provides context |
| `DialogTrigger` | Opens the dialog                        |
| `DialogOverlay` | Closes the dialog through the overlay   |
| `DialogContent` | Modal content                           |
| `DialogClose`   | Explicitly closes the dialog            |

## State and events

- State: `open`, `defaultOpen`, and `disabled`
- `onOpenChange(open, details)`: runs synchronously before state changes and can cancel the request
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

Canceled requests leave uncontrolled state unchanged and emit no `update:open`. When `open` is provided, it always determines visibility: allowed requests take effect only after the parent updates the prop. The parent can still change the prop independently after a canceled request.

::: info Platform notes
H5 supports overlay close, Escape, focus trapping, background `inert`, and restoring focus to Trigger. Native Wevu SFCs close through an explicit Close control or the overlay. They have no browser `document` keyboard listeners or DOM focus, inert, or portal semantics. Both runtimes share the reason/cancel state contract and implement rendering separately.
:::
