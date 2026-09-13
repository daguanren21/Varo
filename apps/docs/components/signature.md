# Signature 签名

`VSignature` 使用归一化笔画数据作为跨端受控值。H5 使用 pointer canvas；小程序使用原生 canvas touch 事件。

## 演示

<SignatureDemo locale="zh" />

## Props

| Prop         | 类型                | 默认值            | 描述           |
| ------------ | ------------------- | ----------------- | -------------- |
| `value`      | `SignatureStroke[]` | `[]`              | 受控签名笔画   |
| `disabled`   | `boolean`           | `false`           | 禁止绘制与清除 |
| `height`     | `number`            | `200`             | 画布高度       |
| `lineColor`  | `string`            | `'#172033'`       | 画笔颜色       |
| `lineWidth`  | `number`            | `2`               | 画笔宽度       |
| `background` | `string`            | `'#ffffff'`       | 画布背景       |
| `showClear`  | `boolean`           | `true`            | 显示清除按钮   |
| `clearText`  | `string`            | `'清除签名'`      | 清除按钮文案   |
| `ariaLabel`  | `string`            | `'Signature pad'` | 画布可访问名称 |

## Events

| Event          | Payload             | 描述         |
| -------------- | ------------------- | ------------ |
| `update:value` | `SignatureStroke[]` | 提交笔画     |
| `change`       | `SignatureStroke[]` | 签名变化     |
| `start`        | `void`              | 开始一笔     |
| `end`          | `SignatureStroke`   | 完成一笔     |
| `clear`        | `void`              | 清除全部笔画 |
