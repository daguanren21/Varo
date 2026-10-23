# FileType 文件类型

`VFileType` 是独立、无状态的文件类型展示组件，根据文件名与 MIME 显示图标和简短的类型标签。它不读取文件、请求 URL、检测文件内容或决定是否允许上传。

## 演示

<ComponentPlatformDemo component="file-type" locale="zh">
  <FileTypeDemo locale="zh" />
</ComponentPlatformDemo>

## 基础用法

```vue
<script setup lang="ts">
import { VFileType } from '@varo-ui/h5'
</script>

<template>
  <VFileType filename="report.pdf" label="PDF 报告" />
  <VFileType filename="download" mime-type="image/png" label="图像文件" />
  <span class="inline-flex items-center gap-2">
    <VFileType filename="budget.xlsx" decorative />
    <span>budget.xlsx</span>
  </span>
</template>
```

文件名已显示在图标旁时使用 `decorative`，避免重复朗读。独立图标默认使用 `role="img"` 与英文类型描述，如 `PDF document (PDF)`；`label` 可提供本地化名称。类型标记与图形同时表达类别，不仅依赖颜色。未知文件使用中性的 `FILE`。

## Native 源码安装

安装 Registry 项 `file-type` 后，H5 源码入口为 `@/components/ui/file-type`，原生入口为 `@/components/ui/v-file-type.vue`。组件依赖 `icon`、基础主题和原生 `cn`；不需要 Agent 组件包。

```vue
<script setup lang="ts">
import VFileType from '@/components/ui/v-file-type.vue'
</script>

<template>
  <view class="flex items-center gap-2">
    <VFileType filename=".env.local" decorative />
    <text>.env.local</text>
  </view>
</template>
```

原生组件使用全局主题 CSS（`apply-shared`），按安装流程加载 `varo.css` 和依赖样式。不要把这些全局样式导入组件局部 WXSS。

## 识别顺序

1. 已识别的特殊文件名或扩展名优先于 MIME，例如 `report.pdf` 配合 `image/png` 仍显示 PDF。
2. 文件名未知或缺失时，使用已识别的 MIME；MIME 忽略大小写、首尾空格和 `;` 后的参数。
3. 两者都未知时显示 `FILE`，类别为 `unknown`。

文件名不区分大小写，支持 POSIX/Windows 路径、URL 路径与百分号编码。查询字符串和片段不参与识别；域名不是文件名。解析不使用浏览器 `URL` API，错误的百分号编码不会抛错。`data:`、`javascript:` 等不透明 URI 不会被当成文件路径。文件名和标签不会作为 HTML 插入。

## 支持范围

组件按已支持的文件名、扩展名和 MIME 展示类型，无法识别任意文件格式。

| 类别     | 支持的扩展名或文件名                                                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PDF      | `pdf`                                                                                                                                                          |
| 文档     | `doc`、`docx`、`odt`、`rtf`                                                                                                                                    |
| 表格     | `xls`、`xlsx`、`ods`、`csv`、`tsv`                                                                                                                             |
| 演示文稿 | `ppt`、`pptx`、`odp`                                                                                                                                           |
| 图像     | `jpg`、`jpeg`、`png`、`gif`、`webp`、`avif`、`svg`、`bmp`、`ico`、`tif`、`tiff`、`heic`                                                                        |
| 音频     | `mp3`、`wav`、`ogg`、`flac`、`aac`、`m4a`、`opus`                                                                                                              |
| 视频     | `mp4`、`webm`、`mov`、`avi`、`mkv`、`m4v`                                                                                                                      |
| 归档     | `zip`、`rar`、`7z`、`tar`、`gz`、`bz2`、`xz`、`tgz`；`tar.gz` 显示 `GZ`                                                                                        |
| 代码     | `js`、`jsx`、`ts`、`tsx`、`mjs`、`cjs`、`vue`、`html`、`css`、`scss`、`py`、`rb`、`go`、`rs`、`java`、`c`、`h`、`cpp`、`cs`、`php`、`sh`、`sql`、`swift`、`kt` |
| 文本     | `txt`、`md`、`mdx`、`log`；`LICENSE`、`LICENCE` 及其 `.txt`/`.md` 形式                                                                                         |
| 配置     | `json`、`jsonc`、`yaml`、`yml`、`toml`、`ini`、`xml`、`env`；`.env`、`.env.*`、`Dockerfile`、`Dockerfile.*`、`.gitignore`、`.gitattributes`                    |

MIME 回退支持 PDF、Word/Excel/PowerPoint、OpenDocument、RTF、CSV/TSV、ZIP/RAR/7z/TAR/GZIP/BZIP2/XZ、JavaScript/HTML/CSS/Python/Shell/SQL、JSON/XML/YAML/TOML、纯文本与 Markdown。合法的 `image/*`、`audio/*`、`video/*` 分别显示 `IMG`、`AUD`、`VID`。未列出的 MIME（包括 `application/octet-stream`）保持未知；扩展名仍可优先给出类别。

## 纯函数

```ts
import { classifyFileType } from '@varo-ui/h5'

classifyFileType('https://files.example/report.PDF?download=1', 'image/png')
// { family: 'pdf', extension: 'pdf', label: 'PDF', description: 'PDF document', source: 'filename' }

classifyFileType('download', 'image/png')
// { family: 'image', extension: '', label: 'IMG', description: 'Image', source: 'mime' }
```

源码安装的两种渲染器都可从 `@/components/ui/file-type-utils` 导入纯函数与 `FileTypeInfo`、`FileTypeFamily`、`FileTypeSize` 类型。`extension` 仅记录识别到的扩展名；特殊文件名、MIME 回退和未知输入返回空字符串。`source` 为 `filename`、`mime` 或 `unknown`。

## Props

| Prop         | 类型                   | 默认值       | 说明                            |
| ------------ | ---------------------- | ------------ | ------------------------------- |
| `filename`   | `string`               | `''`         | 文件名、路径或 URL 字符串       |
| `mimeType`   | `string`               | `''`         | 文件名无法识别时使用的 MIME     |
| `size`       | `'sm' \| 'md' \| 'lg'` | `'md'`       | 28、36、44px 图标容器           |
| `decorative` | `boolean`              | `false`      | 隐藏图标的辅助技术语义          |
| `label`      | `string`               | 自动类型描述 | 独立图标的可访问名称，可本地化  |
| `className`  | `ClassValue`           | —            | 原生附加样式类；H5 使用 `class` |

组件不发送事件。`data-family` 和 `data-size` 表示展示状态。

## 附件与演示

[AgentAttachmentList](/ai/attachments) 在没有 `previewUrl` 时使用装饰性的 `VFileType`；预览图始终优先。`remove` 返回原始附件，由应用决定是否接受移除操作。

H5 Playground 的 `?demo=file-type` 与原生 `component-lab/file-type/index` 展示常见格式、特殊文件名、未知格式、长文件名、独立图标、预览切换、移除与恢复。分类不会改变上传白名单、大小限制或服务器验证。
