# @varo-ui/ai

Provider-neutral Agent event protocol, SSE/chunk decoding, streaming controller, and safe Markdown view model for Varo applications.

## Install

```bash
pnpm add @varo-ui/ai
```

## Usage

```ts
import { createAgentSseEventSource, createAgentStreamController } from '@varo-ui/ai'

const transport = createAgentSseEventSource()
const controller = createAgentStreamController()

requestTask.onChunkReceived(({ data }) => transport.feed(data))
await controller.connect(transport.source)
```

`connect()` owns the iterator lifecycle: protocol `done`/`error` events settle the connection and request iterator cleanup, while natural iterator exhaustion synthesizes `done`.

## Thread versions

```ts
import { createAgentThreadController } from '@varo-ui/ai'

const thread = createAgentThreadController()
thread.append({ id: 'root', label: 'Initial answer' })
thread.fork('root', { id: 'verified', label: 'Verified branch' })
thread.select('root')
```

The controller owns an immutable acyclic version graph. `append()` and `fork()` activate the new version; invalid ids, missing parents, cycles, and post-destroy mutations fail immediately.

[Documentation](https://daguanren21.github.io/Varo/ai/) · [Repository](https://github.com/daguanren21/Varo)
