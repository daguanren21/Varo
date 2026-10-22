# FileType

`VFileType` is an independent, stateless component that displays a file icon and short type label based on a filename and MIME type. It does not read files, fetch URLs, inspect content, or decide whether an upload is allowed.

## Basic usage

```vue
<script setup lang="ts">
import { VFileType } from '@varo-ui/h5'
</script>

<template>
  <VFileType filename="report.pdf" label="PDF report" />
  <VFileType filename="download" mime-type="image/png" label="Image file" />
  <span class="inline-flex items-center gap-2">
    <VFileType filename="budget.xlsx" decorative />
    <span>budget.xlsx</span>
  </span>
</template>
```

Use `decorative` when the filename appears next to the icon to avoid duplicate announcements. Standalone icons default to `role="img"` with an English type description such as `PDF document (PDF)`; use `label` to localize it. A graphic and text label convey the type alongside color. Unknown files use the neutral `FILE` label.

## Native source installation

Install the `file-type` Registry item. The H5 source entry is `@/components/ui/file-type`; native uses `@/components/ui/v-file-type.vue`. Dependencies are `icon`, the base theme, and native `cn`. No Agent suite is required.

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

Native components use global theme CSS with `apply-shared`. Load `varo.css` and the dependency styles through the installation workflow; do not import these global styles into local component WXSS.

## Classification precedence

1. A recognized special basename or extension wins over MIME. For example, `report.pdf` with `image/png` still displays PDF.
2. An unknown or missing filename falls back to a recognized MIME. MIME matching ignores case, surrounding whitespace, and parameters after `;`.
3. If neither is recognized, the family is `unknown` and the label is `FILE`.

Matching ignores filename case and handles POSIX/Windows paths, URL paths, and percent encoding. Query strings and fragments do not affect classification; a URL hostname is not a filename. Parsing requires no browser `URL` API and malformed percent escapes do not throw. Opaque URIs such as `data:` and `javascript:` are not treated as file paths. Filenames and labels are never inserted as HTML.

## Supported scope

The component displays types for a fixed set of filenames, extensions, and MIME types. It cannot detect arbitrary file formats.

| Family        | Supported extensions or names                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PDF           | `pdf`                                                                                                                                                          |
| Document      | `doc`, `docx`, `odt`, `rtf`                                                                                                                                    |
| Spreadsheet   | `xls`, `xlsx`, `ods`, `csv`, `tsv`                                                                                                                             |
| Presentation  | `ppt`, `pptx`, `odp`                                                                                                                                           |
| Image         | `jpg`, `jpeg`, `png`, `gif`, `webp`, `avif`, `svg`, `bmp`, `ico`, `tif`, `tiff`, `heic`                                                                        |
| Audio         | `mp3`, `wav`, `ogg`, `flac`, `aac`, `m4a`, `opus`                                                                                                              |
| Video         | `mp4`, `webm`, `mov`, `avi`, `mkv`, `m4v`                                                                                                                      |
| Archive       | `zip`, `rar`, `7z`, `tar`, `gz`, `bz2`, `xz`, `tgz`; `tar.gz` displays `GZ`                                                                                    |
| Code          | `js`, `jsx`, `ts`, `tsx`, `mjs`, `cjs`, `vue`, `html`, `css`, `scss`, `py`, `rb`, `go`, `rs`, `java`, `c`, `h`, `cpp`, `cs`, `php`, `sh`, `sql`, `swift`, `kt` |
| Text          | `txt`, `md`, `mdx`, `log`; `LICENSE`, `LICENCE`, and their `.txt`/`.md` forms                                                                                  |
| Configuration | `json`, `jsonc`, `yaml`, `yml`, `toml`, `ini`, `xml`, `env`; `.env`, `.env.*`, `Dockerfile`, `Dockerfile.*`, `.gitignore`, `.gitattributes`                    |

MIME fallback recognizes PDF, Word/Excel/PowerPoint, OpenDocument, RTF, CSV/TSV, ZIP/RAR/7z/TAR/GZIP/BZIP2/XZ, JavaScript/HTML/CSS/Python/Shell/SQL, JSON/XML/YAML/TOML, plain text, and Markdown. Valid `image/*`, `audio/*`, and `video/*` types display `IMG`, `AUD`, and `VID`. Other MIME types, including `application/octet-stream`, remain unknown unless the filename already supplied a recognized type.

## Pure classifier

```ts
import { classifyFileType } from '@varo-ui/h5'

classifyFileType('https://files.example/report.PDF?download=1', 'image/png')
// { family: 'pdf', extension: 'pdf', label: 'PDF', description: 'PDF document', source: 'filename' }

classifyFileType('download', 'image/png')
// { family: 'image', extension: '', label: 'IMG', description: 'Image', source: 'mime' }
```

Both source-installed renderers can import the helper and the `FileTypeInfo`, `FileTypeFamily`, and `FileTypeSize` types from `@/components/ui/file-type-utils`. `extension` contains only a recognized extension; special basenames, MIME fallback, and unknown inputs return an empty string. `source` is `filename`, `mime`, or `unknown`.

## Props

| Prop         | Type                   | Default                    | Description                                       |
| ------------ | ---------------------- | -------------------------- | ------------------------------------------------- |
| `filename`   | `string`               | `''`                       | Filename, path, or URL string                     |
| `mimeType`   | `string`               | `''`                       | MIME fallback for unrecognized filenames          |
| `size`       | `'sm' \| 'md' \| 'lg'` | `'md'`                     | 28, 36, or 44px icon container                    |
| `decorative` | `boolean`              | `false`                    | Hide icon semantics from assistive technology     |
| `label`      | `string`               | Automatic type description | Localizable accessible name for a standalone icon |
| `className`  | `ClassValue`           | —                          | Additional native classes; H5 uses `class`        |

The component emits no events. `data-family` and `data-size` expose the display state.

## Attachments and demos

[AgentAttachmentList](/en/ai/attachments) uses decorative `VFileType` icons when `previewUrl` is absent. Preview images always take precedence. `remove` returns the original attachment; the application decides whether to accept the removal.

The H5 Playground route `?demo=file-type` and native `component-lab/file-type/index` demonstrate common formats, special names, unknown types, long filenames, standalone icons, preview switching, removal, and restoration. Classification never changes upload allowlists, size limits, or server validation.
