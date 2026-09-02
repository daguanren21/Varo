# Dialog

模态交互基座：Root、Trigger、Overlay、Content、Close 拆分组合。

## 运行时归属

`useDialogRoot` 来自 `@varo-ui/headless`；焦点策略、portal 和动画由 H5/UI wrapper 增强。

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
- 事件：`update:open`、`openChange`。

## 平台说明

H5 支持 Escape；小程序依赖显式 Close/遮罩。完整焦点陷阱留给 UI wrapper。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
