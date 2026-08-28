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
void controller.connect(transport.source)
```

[Documentation](https://daguanren21.github.io/Varo/ai/) · [Repository](https://github.com/daguanren21/Varo)
