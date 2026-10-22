# Dialog

通过 Root、Trigger、Overlay、Content 和 Close 组合模态对话框。

## 运行时归属

`useDialogRoot` 来自 `@varo-ui/headless`，管理平台中立的打开、关闭请求、请求原因与同步取消。H5 适配层负责焦点陷阱、背景 `inert` 和 Trigger 焦点恢复；portal 与动画由上层处理。

本页 Parts 与交互示例仅来自 `@varo-ui/h5/primitives`。原生端使用独立的 Wevu SFC，原生标签页仅展示源码和支持证据，不提供 Vue Parts 预览。

## 演示

<PrimitiveExample name="dialog" locale="zh" />

## Parts

| Part            | 作用                     |
| --------------- | ------------------------ |
| `DialogRoot`    | 管理打开状态并提供上下文 |
| `DialogTrigger` | 打开对话框               |
| `DialogOverlay` | 通过遮罩关闭对话框       |
| `DialogContent` | 模态内容                 |
| `DialogClose`   | 显式关闭对话框           |

## 状态与事件

- 状态：`open`、`defaultOpen`、`disabled`
- `onOpenChange(open, details)`：在写入状态前同步调用，可在回调中取消请求
- 适配层事件：先触发 `openChange(open, details)`；请求未取消时才触发 `update:open(open)`

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

必须在回调返回前同步取消请求：

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

取消请求后，非受控状态不变，适配层也不发出 `update:open`。传入 `open` 时，显示状态始终以该 prop 为准：未取消的请求也需等待上层更新 prop；请求取消后，上层仍可独立修改 prop。

::: info 平台差异
H5 支持点击遮罩关闭、Escape、焦点陷阱、背景 `inert`，以及关闭后将焦点恢复到 Trigger。原生 Wevu SFC 通过显式 Close 或遮罩关闭，不提供浏览器 `document` 键盘监听，也不具备 DOM 焦点、inert 或 portal 语义。两端共用 reason/cancel 状态规则，各自实现渲染。
:::
