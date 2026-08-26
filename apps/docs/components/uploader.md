# Uploader 上传

## 演示

<FormComponentDemo example="uploader" locale="zh" />

## 限制数量

通过 `maxCount` 控制最大上传数量，通过 `accept` 限制文件类型。

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `value` | `UploaderFile[]` | `[]` | 文件列表 |
| `accept` | `string` | `undefined` | 文件类型 |
| `multiple` | `boolean` | `false` | 是否多选 |
| `maxCount` | `number` | `Infinity` | 最大文件数量 |
| `listType` | `'list' \| 'card'` | `'list'` | 文件列表展示形态 |
| `disabled` | `boolean` | `false` | 禁用上传 |
| `uploadText` | `string` | `'Upload'` | 上传入口文案 |

## UploaderFile

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | 文件名 |
| `status` | `'ready' \| 'uploading' \| 'done' \| 'failed'` | 文件状态 |
| `progress` | `number` | 上传进度，0-100 |
| `url` | `string` | 图片或预览地址 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:value` | `UploaderFile[]` | 文件列表变化 |
| `change` | `UploaderFile[]` | 文件列表变化 |
| `delete` | `UploaderFile` | 删除文件 |
