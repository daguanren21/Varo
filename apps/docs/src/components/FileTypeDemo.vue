<script setup lang="ts">
import { VFileType } from '@varo-ui/h5'
import { computed } from 'vue'
import DocsDeviceFrame from './DocsDeviceFrame.vue'

const props = withDefaults(defineProps<{ locale?: 'zh' | 'en' }>(), { locale: 'zh' })
const files = ['report.pdf', 'budget.xlsx', 'photo.png', 'audio.mp3', 'archive.zip', 'source.ts']
const sizes = ['sm', 'md', 'lg'] as const
const copy = computed(() => props.locale === 'en'
  ? { common: 'Common formats', fallback: 'Names and MIME fallback', sizes: 'Icon sizes', special: 'Special filename', unknown: 'Unknown format', pdf: 'PDF document' }
  : { common: '常见格式', fallback: '文件名与 MIME 回退', sizes: '图标尺寸', special: '特殊文件名', unknown: '未知格式', pdf: 'PDF 文档' })
const fallbackFiles = computed(() => [
  { filename: 'download', mimeType: 'image/png', description: 'MIME: image/png' },
  { filename: '.env.local', mimeType: '', description: copy.value.special },
  { filename: 'asset.custom', mimeType: '', description: copy.value.unknown },
])
</script>

<template>
  <DocsDeviceFrame>
    <div class="file-type-demo">
      <section data-docs-case="common-formats">
        <h3>{{ copy.common }}</h3>
        <div class="file-type-demo__files">
          <div v-for="filename in files" :key="filename" class="file-type-demo__file">
            <VFileType :filename="filename" decorative />
            <span>{{ filename }}</span>
          </div>
        </div>
      </section>
      <section data-docs-case="fallbacks">
        <h3>{{ copy.fallback }}</h3>
        <div class="file-type-demo__fallbacks">
          <div v-for="file in fallbackFiles" :key="file.filename" class="file-type-demo__file">
            <VFileType :filename="file.filename" :mime-type="file.mimeType" decorative />
            <div class="file-type-demo__description">
              <span>{{ file.filename }}</span>
              <small>{{ file.description }}</small>
            </div>
          </div>
        </div>
      </section>
      <section data-docs-case="sizes">
        <h3>{{ copy.sizes }}</h3>
        <div class="file-type-demo__sizes">
          <div v-for="size in sizes" :key="size" class="file-type-demo__size">
            <VFileType filename="report.pdf" :size="size" :label="copy.pdf" />
            <small>{{ size }}</small>
          </div>
        </div>
      </section>
    </div>
  </DocsDeviceFrame>
</template>

<style scoped>
.file-type-demo {
  display: grid;
  gap: 16px;
  min-width: 0;
  color: var(--varo-ui-text);
}

.file-type-demo section {
  min-width: 0;
  padding: 16px;
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border);
  border-radius: 14px;
}

.file-type-demo h3 {
  padding: 0;
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 20px;
}

.file-type-demo__files {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 12px;
}

.file-type-demo__file {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  font-size: 12px;
  line-height: 18px;
  overflow-wrap: anywhere;
}

.file-type-demo__fallbacks {
  display: grid;
  gap: 14px;
}

.file-type-demo__description {
  display: grid;
  min-width: 0;
}

.file-type-demo small {
  font-size: 11px;
  line-height: 16px;
  color: var(--varo-ui-text-muted);
}

.file-type-demo__sizes {
  display: flex;
  gap: 28px;
  align-items: end;
}

.file-type-demo__size {
  display: grid;
  gap: 8px;
  justify-items: center;
}
</style>
