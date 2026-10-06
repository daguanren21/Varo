<script setup lang="ts">
import catalog from '../registry-catalog.json'

const { locale = 'zh' } = defineProps<{
  locale?: 'en' | 'zh'
}>()

const copy = locale === 'zh'
  ? {
      contract: 'Registry 源码覆盖',
      h5Registry: 'H5 组件族',
      weappRegistry: '原生组件族',
      nativeSfc: '原生 SFC 文件',
      profiles: '安装 profiles',
      source: '根据实际 Registry 清单生成，不再手工维护组件计数。',
      experimental: '实验性 profiles',
      evidence: '源码准入、编译产物、浏览器预览与真机认证分别验证；以下覆盖数不代表真机通过。',
    }
  : {
      contract: 'Registry source coverage',
      h5Registry: 'H5 families',
      weappRegistry: 'Native families',
      nativeSfc: 'Native SFC files',
      profiles: 'Install profiles',
      source: 'Generated from authored Registry manifests, without hand-maintained counts.',
      experimental: 'Experimental profiles',
      evidence: 'Source admission, compilation, browser preview, and device certification are separate checks. These counts do not certify devices.',
    }
const components = Object.values(catalog.components)
const experimental = Object.values(catalog.profiles).filter(profile => profile.maturity === 'experimental')
const metrics = [
  { label: copy.h5Registry, value: components.filter(item => item.targets.includes('h5')).length },
  { label: copy.weappRegistry, value: components.filter(item => item.targets.includes('weapp')).length },
  { label: copy.nativeSfc, value: new Set(components.flatMap(item => item.nativeFiles.map(file => file.from))).size },
  { label: copy.profiles, value: Object.keys(catalog.profiles).length },
]
</script>

<template>
  <div class="registry-coverage-evidence">
    <header>
      <strong>{{ copy.contract }}</strong>
      <span>{{ copy.source }}</span>
    </header>
    <div class="registry-coverage-evidence__metrics">
      <article v-for="metric in metrics" :key="metric.label">
        <strong>{{ metric.value }}</strong>
        <span>{{ metric.label }}</span>
      </article>
    </div>
    <p>{{ copy.evidence }}</p>
    <p>
      <strong>{{ copy.experimental }}</strong>
      <code v-for="profile in experimental" :key="profile.id">{{ profile.id }}</code>
    </p>
  </div>
</template>

<style scoped>
.registry-coverage-evidence {
  display: grid;
  gap: 14px;
  margin: 18px 0 28px;
}

.registry-coverage-evidence > header {
  display: grid;
  gap: 5px;
}

.registry-coverage-evidence > header span,
.registry-coverage-evidence p {
  color: var(--varo-muted);
}

.registry-coverage-evidence__metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.registry-coverage-evidence__metrics article {
  display: grid;
  gap: 4px;
  padding: 14px;
  background: var(--varo-card);
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius-lg);
}

.registry-coverage-evidence__metrics article strong {
  font-size: 1.45rem;
  color: var(--varo-foreground);
}

.registry-coverage-evidence__metrics article span {
  font-size: 0.78rem;
  color: var(--varo-muted);
}

.registry-coverage-evidence p {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  align-items: center;
  margin: 0;
}

.registry-coverage-evidence p strong,
.registry-coverage-evidence p span {
  margin-right: 4px;
}

.registry-coverage-evidence code {
  font-size: 0.75rem;
}

@media (max-width: 640px) {
  .registry-coverage-evidence__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
