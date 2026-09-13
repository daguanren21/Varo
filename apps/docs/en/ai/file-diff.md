# AgentFileDiff

A dual-target review surface for Agent changes: unified/split layouts, inline changes, collapsed context, line selection, and accept/reject actions.

## Demo

<AgentComponentDemo component="file-diff" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import type { AgentDiffLine, AgentDiffView } from '@/components/agent-ui'
import { shallowRef } from 'vue'
import { AgentFileDiff } from '@/components/agent-ui'

const view = shallowRef<AgentDiffView>('unified')
const lines: AgentDiffLine[] = [
  { content: '@@ -16,5 +16,6 @@ createAgentStream', type: 'hunk' },
  { content: '  const status = shallowRef<\'idle\' | \'done\'>(\'idle\')', oldNumber: 17, type: 'remove' },
  { content: '  const status = shallowRef<AgentStreamStatus>(\'streaming\')', newNumber: 17, type: 'add' },
  { content: '  const scheduler = target === \'weapp\' ? \'time-slice\' : \'raf\'', newNumber: 18, type: 'add' },
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

| Prop                 | Type                           | Default     | Description                                                 |
| -------------------- | ------------------------------ | ----------- | ----------------------------------------------------------- |
| `className`          | `ClassValue`                   | `undefined` | Root classes merged by the target-specific `cn` helper      |
| `filename`           | `string`                       | `required`  | File path; the header separates directory and basename      |
| `lines`              | `AgentDiffLine[]`              | `[]`        | Diff rows supporting `add`, `remove`, `context`, and `hunk` |
| `additions`          | `number`                       | auto        | Overrides the computed addition count                       |
| `deletions`          | `number`                       | auto        | Overrides the computed deletion count                       |
| `open`               | `boolean`                      | `undefined` | Controlled expanded state                                   |
| `defaultOpen`        | `boolean`                      | `true`      | Initial uncontrolled expanded state                         |
| `view`               | `AgentDiffView`                | `undefined` | Controlled `unified` / `split` view                         |
| `defaultView`        | `AgentDiffView`                | `unified`   | Initial uncontrolled view                                   |
| `wrap`               | `boolean`                      | `undefined` | Controlled code wrapping state                              |
| `defaultWrap`        | `boolean`                      | `false`     | Initial uncontrolled wrapping state                         |
| `lineNumbers`        | `boolean`                      | `undefined` | Controlled line-number state                                |
| `defaultLineNumbers` | `boolean`                      | `true`      | Initial uncontrolled line-number state                      |
| `indicators`         | `bars \| classic \| none`      | `bars`      | Change indicator treatment                                  |
| `inlineChanges`      | `boolean`                      | `true`      | Highlights changed spans in paired deletion/addition rows   |
| `showToolbar`        | `boolean`                      | `true`      | Shows layout, wrapping, and line-number controls            |
| `showActions`        | `boolean`                      | `true`      | Shows accept/reject actions                                 |
| `disabled`           | `boolean`                      | `false`     | Disables review actions                                     |
| `labels`             | `Partial<AgentFileDiffLabels>` | `{}`        | Overrides interface copy                                    |
| `status`             | `AgentAdvancedStatus`          | `completed` | Agent status                                                |

## Events

| Event                | Payload              | Description                                      |
| -------------------- | -------------------- | ------------------------------------------------ |
| `accept`             | `void`               | Accepts the current file change                  |
| `reject`             | `void`               | Rejects the current file change                  |
| `select`             | `AgentDiffSelection` | Selects a unified row or one side of a split row |
| `expand`             | `(line, index)`      | Requests expansion of collapsed `hunk` context   |
| `update:open`        | `boolean`            | Expanded state changed                           |
| `update:view`        | `AgentDiffView`      | Unified/split view changed                       |
| `update:wrap`        | `boolean`            | Wrapping state changed                           |
| `update:lineNumbers` | `boolean`            | Line-number state changed                        |

## Slots

| Slot   | Props                   | Description                                                        |
| ------ | ----------------------- | ------------------------------------------------------------------ |
| `line` | `{ line, index, side }` | Overrides code-content rendering for an existing token highlighter |

::: info Target notes

| Target | Import                                                                                                      |
| ------ | ----------------------------------------------------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                                                                   |
| weapp  | Default export from `@/components/agent-ui/AgentFileDiff.vue`; types from `@/components/agent-ui/file-diff` |

:::
