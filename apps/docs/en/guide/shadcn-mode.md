# shadcn Mode

Varo registry is not only an npm package story. It gives product teams target-correct source files they can own: TypeScript runtime source on H5; native Vue SFCs for the mini-program Base Kit; and target-neutral TypeScript runtime source backed by mini-program primitives for the extended high-consensus set.

## One Mode, Two Runtime Bridges

Varo has one shadcn mode. `--target` selects the runtime bridge installed into the project; it does not select a different component system or development workflow.

The following contracts stay identical across H5 and mini-program targets:

- Registry item names, CLI workflow, and source ownership;
- `V*` component names, props, events, slots, and form Hook APIs;
- business import paths and wrapper boundaries;
- semantic theme tokens, validation results, and controlled/uncontrolled state contracts.

Rendering may differ. H5 uses Vue and DOM semantics; mini-programs use Wevu, WXML/WXSS, and native elements. Product code still imports from the same entry:

```text
src/components/ui/form.ts
```

The H5 item writes the implementation directly to `form.ts`. The mini-program item writes a barrel at the same path and keeps native renderers in `v-form.vue` and `v-form-item.vue`. Both targets expose the same `VForm`, `VFormItem`, props, events, slots, and form Hook APIs; only renderer-owned files differ between Vue and Wevu. This preserves shadcn/vue's open-code, consumer-owned workflow without forcing a Web-only runtime onto mini-programs.

### Reka UI and shadcn-vue

Reka UI is the successor to Radix Vue. It is a useful H5 implementation reference for accessibility, keyboard navigation, and focus management, but it does not define Varo's public shadcn contract. An H5 component may use Reka UI internally while the mini-program renderer implements the same `V*` API through `primitives-core` and Wevu.

### Forms and vee-validate

`vee-validate` directly peers on and imports Vue, so it cannot be the cross-target foundation for Wevu mini-programs. Varo uses `useForm`, `useField`, and `defineRule` exported by `@varo-ui/headless` as the shared form core. An injected Reactive Runtime lets the same API provide field registration, nested paths, sync/async rules, dirty, touched, errors, reset, field validation, and `handleSubmit` on Vue and Wevu.

H5 products may opt into vee-validate in their business layer, but Base Kit and Registry components must retain the same Varo form contract to prevent target API drift.

## Add Components

```bash
# weapp-vite Base Kit
pnpm dlx @varo-ui/cli add --target weapp-vite button select card

# weapp-vite high-consensus extensions
pnpm dlx @varo-ui/cli add --target weapp-vite action-sheet collapse dialog list notice-bar popover skeleton steps

# H5
pnpm dlx @varo-ui/cli add --target h5 button select card
```

The mini-program target receives:

```text
src/components/ui/v-button.vue
src/components/ui/select.vue
src/components/ui/v-card.vue
src/lib/cn.ts
src/styles/varo.css
```

Files that would shadow native mini-program tags use a `v-` prefix. The H5 target receives the matching `.ts` source with the same public contract.

The CLI preserves local files by default. Replace reviewed customizations explicitly:

```bash
pnpm dlx @varo-ui/cli add --target weapp-vite --force button select
```

Blocks resolve target-specific registry dependencies first:

```bash
pnpm dlx @varo-ui/cli add --target weapp-vite blocks/profile-edit
pnpm dlx @varo-ui/cli add --target h5 blocks/profile-edit
```

## Agent UI

```bash
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
```

This installs 36 dual-target Agent components covering loading, reasoning, streaming, messages, tools, tasks, approval, prompt input, code, diffs, image generation, citations, activity, sidebars, context, tables, workflows, fine-tuning, and selection actions. `blocks/agent-chat` provides the complete conversation block, while `@varo-ui/ai` supplies the provider-neutral event protocol, SSE/chunk decoding, and target-specific smooth scheduling.

## Wrap Business Components

Do not push remote search, grouping, and pagination back into the Base Kit. Keep the Base Kit low-level and wrap business behavior in `src/components/biz/*`, for example `src/components/biz/user-select.ts`.

```ts
import { computed, defineComponent, h, shallowRef } from 'vue'
import { VSelect } from '../ui/select'

interface UserRecord {
  id: string
  name: string
  team: string
}

export const UserSelect = defineComponent({
  name: 'UserSelect',
  props: {
    value: String
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const keyword = shallowRef('')
    const users = shallowRef<UserRecord[]>([])
    const options = computed(() =>
      users.value.map(user => ({
        label: `${user.name} / ${user.team}`,
        value: user.id
      }))
    )

    return () =>
      h(VSelect, {
        'value': props.value,
        'options': options.value,
        'placeholder': 'Select user',
        'onUpdate:value': (value: string) => emit('update:value', value),
        'onSearch': (value: string) => {
          keyword.value = value
        }
      })
  }
})
```

`UserSelect` owns remote search, grouping, and pagination. `VSelect` owns option rendering, selection state, and base interaction.

## Layer Boundaries

| Layer             | Location                  | Responsibility                                                                                    |
| ----------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| Headless          | `@varo-ui/headless`       | Runtime-neutral state machines, events, controlled state, and utilities across H5, app, and Weapp |
| Agent Core        | `@varo-ui/ai`             | Event protocol, SSE/chunk transport, smooth text queue, and Markdown AST                          |
| Base Kit          | `src/components/ui/*`     | Copied low-level components that teams can modify                                                 |
| Business Wrappers | `src/components/biz/*`    | Remote search, grouping, pagination, API fields, and product copy                                 |
| Blocks            | `src/components/blocks/*` | Copied business screen slices                                                                     |
