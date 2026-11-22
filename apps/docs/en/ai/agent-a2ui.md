# Native A2UI surfaces

`components/agent-a2ui` is an opt-in Registry unit for WeChat Mini Programs. It uses the official A2UI Core for surfaces and data bindings, and Wevu for native rendering. `blocks/agent-chat` does not install this unit.

## Install

Run this command in a [Wevu Registry project](../guide/shadcn-mode):

```bash
pnpm dlx @varo-ui/cli add --target weapp components/agent-a2ui
```

Install the npm dependencies the CLI lists. Load the copied styles globally as described in the [native style setup](../guide/shadcn-mode). The CLI does not install npm dependencies. For a fresh project that uses both chat and A2UI, list both units in one `add` command to copy shared files once. This unit does not support H5 or experimental Mini Program profiles.

If your project already has shared components, install A2UI in an empty directory and merge the missing files into your project. Do not use `--force` to overwrite customized components.

The entry installs the standard `Object.hasOwn` method only when the host lacks it, as required by the pinned A2UI Core. Existing implementations remain unchanged. Keep `core-compat.js` when copying the unit, not only its SFC files.

## Render a surface and handle actions

Use this example in `src/pages/index/index.vue`. Tapping the button displays the received action without making a network request.

```vue
<script setup lang="ts">
import type { A2uiSurfaceView } from '../../components/agent-a2ui/session'
import { onLoad, onUnload, shallowRef } from 'wevu'
import { A2UI_CATALOG_ID, createA2uiSession } from '../../components/agent-a2ui/session'
import VAgentSurface from '../../components/agent-a2ui/VAgentSurface.vue'

const surfaces = shallowRef<A2uiSurfaceView[]>([])
const receipt = shallowRef('')
const session = createA2uiSession({
  onSurfaces: (views) => { surfaces.value = views },
  onAction: (message) => { receipt.value = JSON.stringify(message) },
})

onLoad(() => session.receive({
  version: '1.0',
  createSurface: {
    surfaceId: 'example',
    catalogId: A2UI_CATALOG_ID,
    components: [
      { id: 'root', component: 'Button', child: 'label', action: { event: { name: 'confirm' } } },
      { id: 'label', component: 'Text', text: 'Confirm' },
    ],
  },
}))
onUnload(() => session.dispose())
</script>

<template>
  <VAgentSurface
    v-for="surface in surfaces"
    :key="surface.id"
    :surface="surface"
    @interaction="session.interact(surface.id, $event)"
  />
  <text>{{ receipt }}</text>
</template>
```

To use A2UI with AgentChat, place `VAgentSurface` in the `context` slot. Keep the application's existing TanStack `ChatClient` connection. In `onCustomEvent`, pass the agreed A2UI messages to `session.receive()`. `onAction` receives a standard A2UI action. The application decides whether to send the action and owns authorization, retries, and idempotency. Call `dispose()` when the session closes. The unit does not require a new transport.

`onAction` may return a Promise. `session.interact()` awaits it and propagates rejection to the caller. Catch errors in the application and display the delivery result. When the application cannot accept actions, pass `:disabled="true"` to `VAgentSurface` so an enabled button cannot silently discard a submission. Server component or object-data replacements invalidate node interaction IDs. Treat them as temporary view identifiers, not persistent IDs.

## Supported catalog

Use the installed `catalog.json` to tell the server which components to send. Load it with a catalog loader that supports A2UI 1.0. The file references the official A2UI 1.0 `common_types.json` and is not a standalone JSON Schema.

This catalog supports `Column`, `Card`, `Text`, `TextField`, and `Button`. It is not the full Basic Catalog. `Text` renders plain text. `TextField` writes back only through a writable data binding. `Button` uses a `Text` child as its label and dispatches events only. The unit does not execute remote RPC.
