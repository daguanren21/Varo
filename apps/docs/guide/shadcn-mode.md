# shadcn 模式

Varo 的 registry 目标不是只发布 npm 包，而是让业务项目拿到可维护的源码基座。你可以先安装 Base Kit，再基于这些文件维护自己的企业组件库。

## 安装组件

```bash
pnpm dlx @varo/cli add button select
```

这会复制：

```text
src/components/ui/button.ts
src/components/ui/select.ts
```

CLI 默认不会覆盖已经存在的文件，避免抹掉业务项目对复制源码的修改。确认本地差异可以被替换后，再显式使用：

```bash
pnpm dlx @varo/cli add --force button select
```

如果安装 block，CLI 会递归安装依赖组件：

```bash
pnpm dlx @varo/cli add blocks/profile-edit
```

`profile-edit` 依赖 `components/select`，最终会得到：

```text
src/components/ui/select.ts
src/components/blocks/profile-edit.vue
```

## 二次封装业务组件

不要把远程搜索、分组、分页直接塞回 Base Kit。Base Kit 保持低层可组合；业务能力在 `src/components/biz/*` 中封装，例如 `src/components/biz/user-select.ts`。

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
        placeholder: '选择用户',
        'onUpdate:value': (value: string) => emit('update:value', value),
        onSearch: (value: string) => {
          keyword.value = value
        }
      })
  }
})
```

这个 `UserSelect` 才是远程搜索、分组、分页和字段映射的归属。`VSelect` 只提供选项展示、选择状态和基础交互。

## 分层边界

| 层级 | 位置 | 职责 |
| --- | --- | --- |
| Primitives | `@varo/primitives-*` | 状态、事件、Root/Trigger/Content 契约 |
| Base Kit | `src/components/ui/*` | 可复制、可改造的低层组件 |
| Business Wrappers | `src/components/biz/*` | 远程搜索、分组、分页、接口字段和业务文案 |
| Blocks | `src/components/blocks/*` | 可复制的业务页面切片 |
