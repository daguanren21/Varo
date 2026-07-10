# shadcn Mode

Varo registry is not only an npm package story. It gives product teams source files they can own, review, and wrap into an internal design system.

## Add Components

```bash
pnpm dlx @varo/cli add button select
```

This copies:

```text
src/components/ui/button.ts
src/components/ui/select.ts
```

The CLI does not overwrite existing files by default, so local changes to copied source remain intact. After reviewing those changes, replace them explicitly with:

```bash
pnpm dlx @varo/cli add --force button select
```

Blocks install their registry dependencies first:

```bash
pnpm dlx @varo/cli add blocks/profile-edit
```

`profile-edit` depends on `components/select`, so the product receives:

```text
src/components/ui/select.ts
src/components/blocks/profile-edit.vue
```

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
      users.value.map((user) => ({
        label: `${user.name} / ${user.team}`,
        value: user.id
      }))
    )

    return () =>
      h(VSelect, {
        value: props.value,
        options: options.value,
        placeholder: 'Select user',
        'onUpdate:value': (value: string) => emit('update:value', value),
        onSearch: (value: string) => {
          keyword.value = value
        }
      })
  }
})
```

`UserSelect` owns remote search, grouping, and pagination. `VSelect` owns option rendering, selection state, and base interaction.

## Layer Boundaries

| Layer | Location | Responsibility |
| --- | --- | --- |
| Primitives | `@varo/primitives-*` | State, events, Root/Trigger/Content contracts |
| Base Kit | `src/components/ui/*` | Copied low-level components that teams can modify |
| Business Wrappers | `src/components/biz/*` | Remote search, grouping, pagination, API fields, and product copy |
| Blocks | `src/components/blocks/*` | Copied business screen slices |
