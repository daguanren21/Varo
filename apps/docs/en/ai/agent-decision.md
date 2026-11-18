# Agent Decision Card

Use `AgentDecisionCard` to collect one option or a custom answer. The card emits an answer request; the application decides whether to accept it, save it, or continue the workflow.

## Install (Wevu mini program)

```bash
pnpm dlx @varo-ui/cli add --target weapp components/agent-decision
```

Install the npm dependencies listed by the CLI. This is a Weapp-only unit and does not require the full `agent-ui` suite. Follow the [Wevu Registry guide](/en/guide/shadcn-mode) to register global `weapp.styles`: `src/styles/varo.css` first, then the component CSS and `src/styles/varo-agent.css` installed by `themes/agent`, all with `include: 'app.vue'`. Do not import global styles from inside the component.

- `src/components/agent-ui/AgentDecisionCard.vue`: displays the question, draft, and application-supplied result.
- `src/components/agent-ui/agent-decision.types.ts`: exports `AgentDecision`, `AgentDecisionOption`, `AgentDecisionAnswer`, and `AgentDecisionIntent`.

## API and state ownership

| Input or event | Contract                                                                                                                                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `:decision`    | Application-supplied `AgentDecision`: `id`, `title`, `options`, `status`, and optional `description`, `allowCustom`, `error`, `answer`. Use a distinct `id` for each question and unique, stable option IDs within the question. |
| `:disabled`    | Optional. Disables editing and submission.                                                                                                                                                                                       |
| `@answer`      | Emits a single `AgentDecisionIntent` (`{ decisionId, answer }`) only when the user taps Submit answer (`提交回答`). `answer` is `{ kind: 'option', optionId }` or `{ kind: 'text', text }`.                                      |

- `pending` has no default answer. A recommendation is only a label. Selecting an option clears the custom draft. Editing the custom answer (`自定义回答`), when allowed, clears the option selection. Submission requires an option still present and enabled, or custom text that is nonempty after trimming.
- `submitting` blocks editing and resubmission. `error` displays the error and preserves the draft so the user can submit again; the card never retries on its own.
- `answered` or an application-supplied `answer` shows Answered (`已回答`) and stops editing. The summary uses only the accepted answer; if its option is no longer listed, the card displays the accepted `optionId`. Changing the decision ID or accepting an answer clears the draft.

In the application, recheck the current decision ID, status, and answer. If submission is asynchronous, set `submitting` before starting, set `answered` and `answer` only after acceptance, and ignore late results for a replaced decision. UI validation and disabling are not authorization. The card does not execute tools, make network requests, or approve actions.

## Local controlled example

```vue
<script setup lang="ts">
import type { AgentDecision, AgentDecisionIntent } from './components/agent-ui/agent-decision.types'
import { shallowRef } from 'wevu'
import AgentDecisionCard from './components/agent-ui/AgentDecisionCard.vue'

const decision = shallowRef<AgentDecision>({
  id: 'format',
  title: 'Which format should the report use?',
  options: [{ id: 'checklist', label: 'Checklist', recommended: true }],
  allowCustom: true,
  status: 'pending',
})

function acceptAnswer({ decisionId, answer }: AgentDecisionIntent) {
  const current = decision.value
  if (current.id !== decisionId || current.status !== 'pending') { return }
  if (answer.kind === 'option') {
    if (!current.options.some(option => option.id === answer.optionId && !option.disabled)) { return }
    decision.value = { ...current, status: 'answered', answer }
    return
  }
  const text = answer.text.trim()
  if (current.allowCustom && text) {
    decision.value = { ...current, status: 'answered', answer: { kind: 'text', text } }
  }
}
</script>

<template>
  <AgentDecisionCard :decision="decision" @answer="acceptAnswer" />
</template>
```
