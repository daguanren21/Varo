<script setup lang="ts">
import baseKit from '../../../../registry/base-kit.phase1.json'
import componentTiers from '../../../../registry/component-tiers.v0.1.json'

const { locale = 'zh' } = defineProps<{
  locale?: 'en' | 'zh'
}>()

const copy = locale === 'zh'
  ? {
      baseKit: 'DevTools 验证的 Base Kit',
      contract: `Registry contract v${componentTiers.version}`,
      highConsensus: '个高共识 Weapp 组件族',
      h5Registry: 'H5 Registry',
      h5Runtime: 'H5 Runtime',
      nativeSfc: 'Weapp Native SFC',
      source: '以下数据直接读取 Registry contract，不在首页维护第二份计数。',
      weappRegistry: 'Weapp Registry',
    }
  : {
      baseKit: 'DevTools-verified Base Kit',
      contract: `Registry contract v${componentTiers.version}`,
      highConsensus: 'high-consensus Weapp component families',
      h5Registry: 'H5 Registry',
      h5Runtime: 'H5 Runtime',
      nativeSfc: 'Weapp Native SFC',
      source: 'These values render directly from the Registry contract; the homepage does not maintain a second count.',
      weappRegistry: 'Weapp Registry',
    }

const metrics = [
  { label: copy.h5Runtime, value: componentTiers.runtimeCatalog.h5 },
  { label: copy.h5Registry, value: componentTiers.registryCatalog.h5 },
  { label: copy.weappRegistry, value: componentTiers.registryCatalog.weappVite },
  { label: copy.nativeSfc, value: componentTiers.registryCatalog.weappSfc },
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
    <p>
      <strong>{{ copy.baseKit }} · {{ baseKit.components.length }}</strong>
      <code v-for="component in baseKit.components" :key="component">{{ component }}</code>
    </p>
    <p>
      <strong>{{ componentTiers.weappHighConsensus.length }} {{ copy.highConsensus }}</strong>
      <span>{{ componentTiers.registryExtensions.join(' · ') }}</span>
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
