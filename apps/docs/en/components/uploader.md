# Uploader

## Basic Usage

<FormComponentDemo example="uploader" locale="en" />

## Max Count

Use `maxCount` to limit files and `accept` to restrict file types.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `UploaderFile[]` | `[]` | File list |
| `accept` | `string` | `undefined` | Accepted file type |
| `multiple` | `boolean` | `false` | Allow multiple files |
| `maxCount` | `number` | `Infinity` | Maximum file count |
| `listType` | `'list' \| 'card'` | `'list'` | File list display type |
| `disabled` | `boolean` | `false` | Disable upload |
| `uploadText` | `string` | `'Upload'` | Upload trigger text |

## UploaderFile

| Field | Type | Description |
| --- | --- | --- |
| `name` | `string` | File name |
| `status` | `'ready' \| 'uploading' \| 'done' \| 'failed'` | File status |
| `progress` | `number` | Upload progress, 0-100 |
| `url` | `string` | Image or preview URL |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `UploaderFile[]` | File list changed |
| `change` | `UploaderFile[]` | File list changed |
| `delete` | `UploaderFile` | Delete file |
