# Dialog

模态交互基座：Root、Trigger、Overlay、Content、Close 拆分组合。

## 运行时归属

`useDialogRoot` 来自 `@varo-ui/headless`，负责平台中立的 open request、reason 与同步取消；H5 adapter 负责焦点陷阱、背景 `inert` 和 Trigger 焦点恢复，portal 与动画仍由更上层决定。

## 演示

<PrimitiveExample name="dialog" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# 或
pnpm add @varo-ui/headless @varo-ui/weapp
```

## 为什么是基础能力

- 确认、审批和高风险操作需要明确的进入与退出契约。
- 拆分 Overlay 和 Content 可适配不同平台渲染。

## Parts

| Part            | 作用              |
| --------------- | ----------------- |
| `DialogRoot`    | open 状态与上下文 |
| `DialogTrigger` | 打开入口          |
| `DialogOverlay` | 遮罩关闭          |
| `DialogContent` | 模态内容          |
| `DialogClose`   | 显式退出          |

## 状态与事件

- 状态：`open`、`defaultOpen`、`disabled`
- `onOpenChange(open, details)`：状态写入前的同步请求 callback
- Adapter 事件：`openChange(open, details)` 先触发；请求未取消时才触发 `update:open(open)`

```ts
type DialogOpenChangeReason
  = | 'trigger-press'
    | 'outside-press'
    | 'escape-key'
    | 'close-press'
    | 'imperative-action'

interface DialogOpenChangeDetails {
  readonly reason: DialogOpenChangeReason
  readonly canceled: boolean
  cancel: () => void
}
```

| `reason`            | 来源                                       |
| ------------------- | ------------------------------------------ |
| `trigger-press`     | Trigger，以及 `events.open()` / `toggle()` |
| `outside-press`     | Overlay / `events.onOverlayClick()`        |
| `escape-key`        | H5 Escape / `events.onEscapeKeyDown()`     |
| `close-press`       | Close / `events.close()`                   |
| `imperative-action` | `api.setOpen()` 的默认原因                 |

取消必须在 callback 返回前同步完成：

```ts
import type { DialogOpenChangeDetails } from '@varo-ui/headless'
import { useDialogRoot } from '@varo-ui/headless'

const hasUnsavedChanges = true

const dialog = useDialogRoot({
  defaultOpen: true,
  onOpenChange(nextOpen: boolean, details: DialogOpenChangeDetails) {
    if (!nextOpen && hasUnsavedChanges) {
      details.cancel()
    }
  }
})
```

取消后，非受控 state 不写入，adapter 也不发出 `update:open`。传入 `open` 时该 prop 始终是最终事实来源：未取消的请求仍需上层应用新 prop 才会改变可见状态；即使请求已取消，上层随后独立改变 prop 时组件仍遵循 prop。

## 平台说明

H5 adapter 支持 overlay、Escape、焦点陷阱、背景 `inert` 与关闭后的 Trigger 焦点恢复。微信小程序原生运行时没有浏览器 `document` 键盘事件或 DOM 焦点/inert/portal 语义，因此原生 Weapp 使用显式 Close 与 overlay。仓库当前 Vue-modeled Weapp adapter 在存在 `document` 的 browser/test surface 会把 Escape 映射为 `escape-key`；这不代表原生微信运行时具备键盘或 DOM 焦点能力。reason/cancel 状态契约在两种 surface 保持一致。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
