<script setup lang="ts">
withDefaults(defineProps<{ locale?: 'zh' | 'en' }>(), { locale: 'zh' })
</script>

<template>
  <div class="preview-loading" role="status" aria-live="polite" aria-atomic="true">
    <svg class="preview-loading__sketch" width="176" height="64" viewBox="0 0 176 64" fill="none" aria-hidden="true" focusable="false">
      <rect class="preview-loading__tile" x="1" y="1" width="42" height="42" rx="12" />
      <path class="preview-loading__mark" d="m12 14 10 17 10-17h-7l-3 6-3-6z" />
      <rect class="preview-loading__line" x="57" y="7" width="118" height="8" rx="4" />
      <rect class="preview-loading__line preview-loading__line--quiet" x="57" y="26" width="78" height="6" rx="3" />
      <rect class="preview-loading__line preview-loading__line--quiet" x="1" y="55" width="54" height="8" rx="4" />
      <rect class="preview-loading__line preview-loading__line--quiet" x="65" y="55" width="110" height="8" rx="4" />
    </svg>
    <span class="preview-loading__label">{{ locale === 'en' ? 'Preparing preview' : '正在准备预览' }}</span>
  </div>
</template>

<style scoped>
.preview-loading {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 160px;
  padding: 24px 16px;
  color: var(--varo-ui-text-regular);
  background: var(--preview-loading-background, var(--varo-ui-surface));
}

.preview-loading__sketch {
  flex: none;
  width: min(176px, 100%);
  height: auto;
}

.preview-loading__tile {
  fill: color-mix(in srgb, var(--varo-ui-primary) 10%, var(--varo-ui-surface));
  stroke: color-mix(in srgb, var(--varo-ui-primary) 20%, transparent);
}

.preview-loading__mark {
  fill: var(--varo-ui-primary);
}

.preview-loading__line {
  fill: color-mix(in srgb, var(--varo-ui-text-muted) 24%, var(--varo-ui-surface));
}

.preview-loading__line--quiet {
  opacity: 0.55;
}

.preview-loading__label {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
}
</style>
