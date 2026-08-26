# shadcn 模式

Varo 的 registry 目标不是只发布 npm 包，而是让业务项目拿到可维护的源码基座。CLI 按目标复制平台正确的文件：H5 使用 TypeScript runtime source；小程序 Base Kit 使用可被 `weapp-vite` 编译成 WXML/WXSS/JSON 的 Vue SFC，扩展高共识组件使用目标中立 TypeScript runtime source 与小程序 primitives。

## 安装组件

```bash
# weapp-vite 小程序 Base Kit
pnpm dlx @varo/cli add --target weapp-vite button select card

# weapp-vite 高共识扩展
pnpm dlx @varo/cli add --target weapp-vite action-sheet collapse dialog list notice-bar popover skeleton steps

# H5
pnpm dlx @varo/cli add --target h5 button select card
```

小程序会得到：

```text
src/components/ui/v-button.vue
src/components/ui/select.vue
src/components/ui/v-card.vue
src/lib/cn.ts
src/styles/varo.css
```

H5 会得到同一公共 API 对应的 `.ts` 组件源码。小程序对与原生标签重名的文件使用 `v-` 前缀，避免 `button`、`input`、`image` 等名称遮蔽微信原生组件。

CLI 默认不会覆盖已经存在的文件。确认本地差异可以被替换后，再显式使用：

```bash
pnpm dlx @varo/cli add --target weapp-vite --force button select
```

安装 Block 时，CLI 会递归安装目标平台需要的组件和工具：

```bash
pnpm dlx @varo/cli add --target weapp-vite blocks/profile-edit
pnpm dlx @varo/cli add --target h5 blocks/profile-edit
```

## Agent UI

```bash
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
pnpm dlx @varo/cli add --target h5 components/agent-ui
```

该条目安装 36 个双端 Agent 组件，覆盖 Loading、Thinking、Streaming、Message、Tool、Task、Approval、Composer、Code、Diff、Image Generation、Citations、Activity、Sidebar、Context、Tables、Flowchart、Fine-tune 与 Selection Actions；`blocks/agent-chat` 提供完整会话 Block。`@varo/agent-core` 提供模型无关事件协议、SSE/分块解码和双端平滑调度。

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
| Agent Core | `@varo/agent-core` | 事件协议、SSE/分块传输、平滑文本队列与 Markdown AST |
| Base Kit | `src/components/ui/*` | 可复制、可改造的低层组件 |
| Business Wrappers | `src/components/biz/*` | 远程搜索、分组、分页、接口字段和业务文案 |
| Blocks | `src/components/blocks/*` | 可复制的业务页面切片 |
