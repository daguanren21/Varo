# Signature 签名

`VSignature` 使用归一化笔画数据作为跨端受控值。H5 使用 pointer canvas；小程序使用原生 canvas touch 事件。开启 `showHistory` 后可逐笔撤销、重做，清除也可以撤销。

## 演示

<ComponentPlatformDemo component="signature" locale="zh">
  <SignatureDemo locale="zh" />
</ComponentPlatformDemo>

## 受控值与历史

```vue
<script setup lang="ts">
import type { SignatureStroke } from '@varo-ui/h5'
import { VSignature } from '@varo-ui/h5'
import { shallowRef } from 'vue'

const value = shallowRef<SignatureStroke[]>([])
</script>

<template>
  <VSignature v-model:value="value" show-history clear-text="清除" />
</template>
```

小程序使用安装到本地的 `v-signature.vue`，响应式 API 从 `wevu` 引入；笔画值和历史行为相同。原生画布使用组件作用域内的 Canvas 2D 节点，并按设备像素比设置绘图分辨率。每笔为 `{ points: [{ x, y }] }`，坐标归一化到 `0..1`，画布调整尺寸后仍可重绘。

- 画 A、B 两笔后撤销得到 A，重做得到 A/B。撤销后画新笔会清除重做分支。
- 清除提交空数组；父级接收后可以撤销清除。初始值是历史起点，不会被视为一次可撤销操作。
- `update:value` 与 `change` 各发出一次更新提案。只有父级回传新 `value` 才推进历史和已提交画布；拒绝或延迟接收时保持原值，不锁定后续操作。手写中的预览在结束后恢复为已接受值，直到父级接收。
- 回传内容相同的深拷贝保留历史。真正的外部替换（包括父级直接清空或修改坐标）会重置历史；回传已提议的更新则执行对应历史转换。
- 绘制过程中不能撤销、重做或清除。取消手势、绘制时禁用组件、绘制时收到不同的父级值都会丢弃未完成的一笔。
- `historyLimit` 是正整数，默认保留最近 100 次已接受编辑；也最多保留 100 个尚未接受提案。改变已接受值后，旧提案失效。超出保留范围或来自旧状态的延迟回传按外部替换处理。

## 实例方法与状态

通过组件 ref 可调用 `undo()`、`redo()`、`clear()`。响应式 `canUndo`、`canRedo` 表示当前是否可以执行操作，禁用或正在绘制时都为 `false`。隐藏内置按钮后仍可使用这些 API 构建工具栏；不可用方法不发出事件。

H5 可从 `@varo-ui/h5` 引入 `SignatureInstance`，用于 `shallowRef<SignatureInstance | null>(null)`。小程序可从安装目录的 `signature-history.ts` 引入该实例类型。

## Props

| Prop           | 类型                | 默认值            | 描述                               |
| -------------- | ------------------- | ----------------- | ---------------------------------- |
| `value`        | `SignatureStroke[]` | `[]`              | 受控签名笔画                       |
| `disabled`     | `boolean`           | `false`           | 禁止绘制、清除、撤销和重做         |
| `height`       | `number`            | `200`             | 画布高度                           |
| `lineColor`    | `string`            | `'#172033'`       | 画笔颜色                           |
| `lineWidth`    | `number`            | `2`               | 画笔宽度                           |
| `background`   | `string`            | `'#ffffff'`       | 画布背景                           |
| `showClear`    | `boolean`           | `true`            | 显示清除按钮                       |
| `clearText`    | `string`            | `'清除签名'`      | 清除按钮文案                       |
| `showHistory`  | `boolean`           | `false`           | 显示撤销和重做按钮                 |
| `undoText`     | `string`            | `'撤销'`          | 撤销按钮文案                       |
| `redoText`     | `string`            | `'重做'`          | 重做按钮文案                       |
| `historyLimit` | `number`            | `100`             | 正整数；保留的编辑与待接收提案上限 |
| `ariaLabel`    | `string`            | `'Signature pad'` | 画布可访问名称                     |

## Events

| Event          | Payload             | 描述                                 |
| -------------- | ------------------- | ------------------------------------ |
| `update:value` | `SignatureStroke[]` | 提议更新受控值，父级决定是否接收     |
| `change`       | `SignatureStroke[]` | 同一提案，紧随 `update:value` 发出   |
| `start`        | `void`              | 开始一笔                             |
| `end`          | `SignatureStroke`   | 完成一笔                             |
| `clear`        | `void`              | 发出清除提案后通知；不代表父级已接收 |

撤销/重做复用 `update:value`、`change`，不会额外触发 `start`、`end` 或 `clear`。`start`/`end` 描述手写手势，不用于判断父级是否接收；已接受笔画数应从 `value.length` 读取。
