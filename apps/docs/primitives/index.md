# Primitives

Primitives 不是另一套 UI 组件清单，而是 Varo 的运行时契约：它们定义状态、触发器、遮罩、定位、滚动和关闭行为，让 H5 与小程序封装可以共享同一套交互语义。展示类组件继续留在组件文档里，这里只保留会影响行为组合的底层能力。

<div class="varo-primitive-stack">
  <section>
    <span>01</span>
    <h2>运行时契约</h2>
    <p>Root 负责状态与上下文，Trigger 负责入口，Content/Overlay 负责可见层，Close 负责退出动作。不同平台可以换渲染细节，但不能改变契约。</p>
  </section>
  <section>
    <span>02</span>
    <h2>组合顺序</h2>
    <p>先放 Root，再放 Trigger，然后放 Overlay 与 Content。组合顺序稳定后，业务 blocks 才能在 H5 和小程序间保持一致。</p>
  </section>
  <section>
    <span>03</span>
    <h2>受控与非受控</h2>
    <p>简单场景使用内部状态；需要埋点、路由同步或表单联动时，使用受控与非受控两种写法切换。</p>
  </section>
</div>

## 交互 Primitive

| Primitive | 包 | 能力 |
| --- | --- | --- |
| `ButtonRoot` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 禁用、加载、按压状态与按钮语义 |
| `InputRoot` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 值同步、格式化、字数限制、聚焦与清空 |
| `CheckboxRoot` / `CheckboxIndicator` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 选中态、禁用态、indicator 渲染与 `data-state` |
| `RadioGroup` / `RadioItem` / `RadioIndicator` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 单选组 value、选项语义、indicator 渲染 |
| `SwitchRoot` / `SwitchThumb` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 开关态、加载态、禁用态与 thumb part 属性 |
| `TabsRoot` / `TabsList` / `TabsTrigger` / `TabsContent` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 当前 tab value、trigger/content 激活态与 tab 语义 |
| `CollapsibleRoot` / `CollapsibleTrigger` / `CollapsibleContent` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 单个 disclosure 的开关、禁用态与内容显隐 |
| `AccordionRoot` / `AccordionItem` / `AccordionTrigger` / `AccordionContent` | `@varo/primitives-h5`、`@varo/primitives-weapp` | single/multiple、collapsible、item disabled 与内容关联语义 |
| `PopoverRoot` / `PopoverTrigger` / `PopoverContent` / `PopoverClose` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 轻量浮层开关、显式关闭、Escape 与外部交互关闭契约 |
| `DialogRoot` / `DialogTrigger` / `DialogOverlay` / `DialogContent` / `DialogClose` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 开关状态、触发器、遮罩、内容区、关闭动作 |
| `OverlayRoot` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 显隐控制、点击遮罩关闭、滚动锁定 |
| `PopupRoot` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 弹出层显隐、位置、遮罩、关闭按钮 |
| `SelectRoot` / `SelectTrigger` / `SelectValue` / `SelectContent` / `SelectGroup` / `SelectLabel` / `SelectItem` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 选择器状态、触发器、值展示、分组与选项语义 |
| `StickyRoot` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 滚动监听、固定状态、顶部偏移 |

<PrimitiveInteractionDemo locale="zh" />

## Reka-style anatomy

Varo primitives 参考 Reka UI 的组合模型，但 API 会保持跨端稳定。以 Select 为例，`SelectRoot / SelectTrigger / SelectValue / SelectContent / SelectItem` 是最小 anatomy；`SelectGroup / SelectLabel` 提供分组语义。Root 持有 `value`、`open`、`disabled`、`readonly`，各 part 只消费上下文并输出 `data-state`、`data-disabled`、`data-placeholder` 等稳定属性。

P0 控件也遵循同一条线：`CheckboxRoot / CheckboxIndicator`、`RadioGroup / RadioItem / RadioIndicator`、`SwitchRoot / SwitchThumb`、`TabsRoot / TabsList / TabsTrigger / TabsContent` 都只定义状态、事件和 part 属性。分组、远程搜索、表单校验、业务禁用规则和视觉 token 应该在 `@varo/ui-*` 或业务组件库里二次封装。

Tabs 的 `value` 同时用于状态与 trigger/panel 关联，因此同一 TabsRoot 内的 value 必须唯一。H5 在自动激活模式下支持 `ArrowLeft / ArrowRight / ArrowUp / ArrowDown / Home / End` 移动焦点并切换 tab；Weapp 保留相同的 ID、orientation 与 ARIA 状态，但不模拟浏览器焦点。

P1 扩展 disclosure 与 floating anatomy：`CollapsibleRoot / CollapsibleTrigger / CollapsibleContent` 处理单个展开区域；`AccordionRoot / AccordionItem / AccordionTrigger / AccordionContent` 处理 single 或 multiple 集合；`PopoverRoot / PopoverTrigger / PopoverContent / PopoverClose` 提供轻量浮层开关和 dismiss 契约。

## 产品边界与开发体验

- primitive 管行为契约：受控/非受控状态、disabled、ARIA、`data-state` 和 dismiss 事件。
- UI wrapper 管视觉与定位：token、动画、图标、浮层位置、碰撞检测和平台渲染细节。
- 业务 wrapper 管数据与场景：远程搜索、权限、分页、领域模型和业务文案。

这个分层让 registry 复制出来的 Base Kit 源码保持可读、可改；团队可以基于相同 primitives 创建自己的 UI 包和业务组件，而不需要复制状态机。H5 `Popover` 默认处理 Escape 与外部点击；小程序没有浏览器级 `document`，应由 copied UI wrapper 使用显式 `PopoverClose`、页面遮罩或页面级 dismiss adapter。

定位引擎、Portal、焦点陷阱、菜单键盘导航和 Tooltip 的长按/触摸策略属于后续 P2。它们需要平台 adapter，不应伪装成完全一致的 DOM 能力。

```vue
<script setup lang="ts">
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue
} from '@varo/primitives-h5'

const options = [
  { label: 'Starter', value: 'starter' },
  { label: 'Base Kit', value: 'base-kit' }
]
</script>

<template>
  <SelectRoot :options="options">
    <SelectTrigger>
      <SelectValue placeholder="选择基座层级" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="option in options" :key="option.value" :option="option">
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </SelectRoot>
</template>
```

## 非受控写法

适合局部确认、菜单和轻量反馈，状态由 primitive 内部维护。

```vue
<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogRoot, DialogTrigger } from '@varo/primitives-h5'
</script>

<template>
  <DialogRoot>
    <DialogTrigger>打开</DialogTrigger>
    <DialogOverlay />
    <DialogContent>
      <p>确认继续当前操作？</p>
      <DialogClose>关闭</DialogClose>
    </DialogContent>
  </DialogRoot>
</template>
```

## 受控写法

适合路由同步、表单联动、埋点和跨端 blocks。业务状态在外层维护，primitive 只消费契约。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DialogClose, DialogContent, DialogOverlay, DialogRoot, DialogTrigger } from '@varo/primitives-h5'

const open = ref(false)
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger>打开安全确认</DialogTrigger>
    <DialogOverlay />
    <DialogContent>
      <p>当前状态可以同步到 H5 或小程序封装。</p>
      <DialogClose>完成</DialogClose>
    </DialogContent>
  </DialogRoot>
</template>
```

## 小程序封装建议

- `@varo/primitives-weapp` 保持 Vue 写法与契约命名，渲染产物交给 `weapp-vite@6.17.8`
- `wevu@6.17.8` 只作为运行时 peer，不进入 primitives-core
- `weapp-tailwindcss@^5.1.8` 可以在业务应用层处理 utility class；primitive 本身仍使用行为契约与 token
- 业务 blocks 应先基于 primitives 定义交互，再由 `@varo/ui-*` 负责视觉样式
