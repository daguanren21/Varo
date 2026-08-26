# AgentFileDiff

A dual-target review surface for Agent changes: unified/split layouts, inline changes, collapsed context, line selection, and accept/reject actions.

## Demo

<AgentComponentDemo component="file-diff" locale="en" />

## Install

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { AgentFileDiff, type AgentDiffLine, type AgentDiffView } from '@/components/agent-ui'

const view = shallowRef<AgentDiffView>('unified')
const lines: AgentDiffLine[] = [
  { content: '@@ -16,5 +16,6 @@ createAgentStream', type: 'hunk' },
  { content: "  const status = shallowRef<'idle' | 'done'>('idle')", oldNumber: 17, type: 'remove' },
  { content: "  const status = shallowRef<AgentStreamStatus>('streaming')", newNumber: 17, type: 'add' },
  { content: "  const scheduler = target === 'weapp' ? 'time-slice' : 'raf'", newNumber: 18, type: 'add' },
  { collapsedLines: 18, content: '@@ More unchanged context', type: 'hunk' }
]
</script>

<template>
  <AgentFileDiff
    v-model:view="view"
    filename="src/runtime/create-agent-stream.ts"
    :lines="lines"
    @accept="applyChanges"
    @reject="discardChanges"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `ClassValue` | `undefined` | Root classes merged by the target-specific `cn` helper |
| `filename` | `string` | `required` | File path; the header separates directory and basename |
| `lines` | `AgentDiffLine[]` | `[]` | Diff rows supporting `add`, `remove`, `context`, and `hunk` |
| `additions` | `number` | auto | Overrides the computed addition count |
| `deletions` | `number` | auto | Overrides the computed deletion count |
| `open` | `boolean` | `undefined` | Controlled expanded state |
| `defaultOpen` | `boolean` | `true` | Initial uncontrolled expanded state |
| `view` | `AgentDiffView` | `undefined` | Controlled `unified` / `split` view |
| `defaultView` | `AgentDiffView` | `unified` | Initial uncontrolled view |
| `wrap` | `boolean` | `undefined` | Controlled code wrapping state |
| `defaultWrap` | `boolean` | `false` | Initial uncontrolled wrapping state |
| `lineNumbers` | `boolean` | `undefined` | Controlled line-number state |
| `defaultLineNumbers` | `boolean` | `true` | Initial uncontrolled line-number state |
| `indicators` | `bars \| classic \| none` | `bars` | Change indicator treatment |
| `inlineChanges` | `boolean` | `true` | Highlights changed spans in paired deletion/addition rows |
| `showToolbar` | `boolean` | `true` | Shows layout, wrapping, and line-number controls |
| `showActions` | `boolean` | `true` | Shows accept/reject actions |
| `disabled` | `boolean` | `false` | Disables review actions |
| `labels` | `Partial<AgentFileDiffLabels>` | `{}` | Overrides interface copy |
| `status` | `AgentAdvancedStatus` | `completed` | Agent status |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `accept` | `void` | Accepts the current file change |
| `reject` | `void` | Rejects the current file change |
| `select` | `AgentDiffSelection` | Selects a unified row or one side of a split row |
| `expand` | `(line, index)` | Requests expansion of collapsed `hunk` context |
| `update:open` | `boolean` | Expanded state changed |
| `update:view` | `AgentDiffView` | Unified/split view changed |
| `update:wrap` | `boolean` | Wrapping state changed |
| `update:lineNumbers` | `boolean` | Line-number state changed |

## Slots

| Slot | Props | Description |
| --- | --- | --- |
| `line` | `{ line, index, side }` | Overrides code-content rendering for an existing token highlighter |

## Design Boundary

The visual and interaction model draws from [@pierre/diffs](https://github.com/pierrecomputer/pierre/tree/main/packages/diffs): a neutral code surface, restrained addition/deletion layers, gutter indicators, unified/split layouts, inline changes, and expandable hunks.

Varo is not a port. `@pierre/diffs` uses Shadow DOM, Shiki, worker pools, and large-scale virtualization for browser code review; those systems cannot run directly in a mini program. `AgentFileDiff` keeps the lighter data contract and consistent interactions appropriate for Agent output on both targets. For H5-only products needing huge diffs, syntax highlighting, annotations, or editing, use `@pierre/diffs` directly.

## Target Notes

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | Default export from `@/components/agent-ui/AgentFileDiff.vue`; types from `@/components/agent-ui/file-diff` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
