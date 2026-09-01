# shadcn 模式

Varo 的 registry 目标不是只发布 npm 包，而是让业务项目拿到可维护的源码基座。CLI 按目标复制平台正确的文件：H5 使用 TypeScript runtime source；小程序 Base Kit 使用可被 `weapp-vite` 编译成 WXML/WXSS/JSON 的 Vue SFC，扩展高共识组件使用目标中立 TypeScript runtime source 与小程序 primitives。

## 一个模式，两套运行桥接

Varo 只有一套 shadcn 模式。`--target` 选择的是安装时的运行桥接，不是另一套组件库或另一种开发方式。

以下契约在 H5 与小程序之间保持一致：

- 相同的 Registry 条目名、CLI 安装流程和源码所有权；
- 相同的 `V*` 组件名、Props、Events、Slots 与表单 Hook API；
- 相同的业务导入路径和二次封装边界；
- 相同的主题语义变量、校验结果与受控/非受控状态约定。

渲染实现可以不同：H5 使用 Vue 和 DOM 语义，小程序使用 Wevu、WXML/WXSS 与原生组件。业务代码仍从相同的入口导入：

```text
src/components/ui/form.ts
```

H5 安装项将组件实现直接写入 `form.ts`；小程序安装项在相同路径写入 barrel，并把原生实现放在 `v-form.vue` 与 `v-form-item.vue`。两端拥有相同的 `VForm`、`VFormItem`、Props、Events、Slots 和表单 Hook API，只在 renderer 所属文件中区分 Vue 与 Wevu。这个模式与 shadcn/vue 的“开放代码、业务持有源码”一致，但不会把 Web-only runtime 强加给小程序。

### Reka UI 与 shadcn-vue

Reka UI 是 Radix Vue 的后续版本，适合作为 H5 端可访问性、键盘导航和焦点管理的实现参考或内部 primitive。它不属于 Varo shadcn 模式的公共契约：即使某个 H5 组件内部采用 Reka UI，小程序仍由 `primitives-core` 状态契约和 Wevu renderer 实现同一 `V*` API。

### 表单与 vee-validate

`vee-validate` 直接依赖并导入 Vue，不能作为 Wevu 小程序的跨端基础依赖。Varo 使用 `@varo-ui/headless` 导出的 `useForm`、`useField` 和 `defineRule` 作为统一表单核心；它们通过注入的 Reactive Runtime 在 Vue 与 Wevu 上运行，提供字段注册、嵌套路径、同步/异步规则、dirty、touched、errors、reset、字段校验与 `handleSubmit`。

H5 可以在业务层自行接入 vee-validate，但 Base Kit 与 Registry 组件必须继续暴露同一套 Varo 表单契约，避免两端 API 分叉。

## 安装组件

```bash
# weapp-vite 小程序 Base Kit
pnpm dlx @varo-ui/cli add --target weapp-vite button select card

# weapp-vite 高共识扩展
pnpm dlx @varo-ui/cli add --target weapp-vite action-sheet collapse dialog list notice-bar popover skeleton steps

# H5
pnpm dlx @varo-ui/cli add --target h5 button select card
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
pnpm dlx @varo-ui/cli add --target weapp-vite --force button select
```

安装 Block 时，CLI 会递归安装目标平台需要的组件和工具：

```bash
pnpm dlx @varo-ui/cli add --target weapp-vite blocks/profile-edit
pnpm dlx @varo-ui/cli add --target h5 blocks/profile-edit
```

## Agent UI

```bash
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
```

该条目安装 36 个双端 Agent 组件，覆盖 Loading、Thinking、Streaming、Message、Tool、Task、Approval、Composer、Code、Diff、Image Generation、Citations、Activity、Sidebar、Context、Tables、Flowchart、Fine-tune 与 Selection Actions；`blocks/agent-chat` 提供完整会话 Block。`@varo-ui/ai` 提供模型无关事件协议、SSE/分块解码和双端平滑调度。

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
      users.value.map(user => ({
        label: `${user.name} / ${user.team}`,
        value: user.id
      }))
    )

    return () =>
      h(VSelect, {
        'value': props.value,
        'options': options.value,
        'placeholder': '选择用户',
        'onUpdate:value': (value: string) => emit('update:value', value),
        'onSearch': (value: string) => {
          keyword.value = value
        }
      })
  }
})
```

这个 `UserSelect` 才是远程搜索、分组、分页和字段映射的归属。`VSelect` 只提供选项展示、选择状态和基础交互。

## 分层边界

| 层级              | 位置                      | 职责                                                   |
| ----------------- | ------------------------- | ------------------------------------------------------ |
| Headless          | `@varo-ui/headless`       | 跨 H5/App/Weapp 的状态机、事件、受控状态与无运行时工具 |
| Agent Core        | `@varo-ui/ai`             | 事件协议、SSE/分块传输、平滑文本队列与 Markdown AST    |
| Base Kit          | `src/components/ui/*`     | 可复制、可改造的低层组件                               |
| Business Wrappers | `src/components/biz/*`    | 远程搜索、分组、分页、接口字段和业务文案               |
| Blocks            | `src/components/blocks/*` | 可复制的业务页面切片                                   |
