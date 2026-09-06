<script setup lang="ts">
import type { ComponentTarget, DocsLocale } from '../component-catalog'
import { computed, shallowRef } from 'vue'
import {
  componentCatalog,
  componentCatalogItems,
  componentCount,
  componentDocsRoute,
} from '../component-catalog'

type AvailabilityFilter = 'all' | 'dual' | ComponentTarget
const props = withDefaults(defineProps<{ locale?: DocsLocale }>(), { locale: 'zh' })

const withDocsBase = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

const query = shallowRef('')
const targetFilter = shallowRef<AvailabilityFilter>('all')

const copy = computed(() => props.locale === 'zh'
  ? {
      all: '全部',
      availability: '按支持端筛选',
      count: '个组件',
      dual: '双端',
      empty: '没有匹配的组件',
      emptyDetail: '尝试其他名称，或清除当前端筛选。',
      eyebrow: 'Registry 组件目录',
      h5: 'H5',
      of: '共',
      open: '查看文档',
      reset: '清除筛选',
      searchLabel: '搜索组件',
      searchPlaceholder: '搜索名称，如 Badge、地图或 Picker',
      summary: '从同一份目录浏览侧边栏中的全部组件，并按 H5、Weapp 或双端可用性缩小范围。',
      targets: '支持端',
      weapp: 'Weapp',
    }
  : {
      all: 'All',
      availability: 'Filter by target availability',
      count: 'components',
      dual: 'Dual',
      empty: 'No components match',
      emptyDetail: 'Try another name or clear the target filter.',
      eyebrow: 'Registry component catalog',
      h5: 'H5',
      of: 'of',
      open: 'Open documentation',
      reset: 'Clear filters',
      searchLabel: 'Search components',
      searchPlaceholder: 'Search by name, such as Badge, Map, or Picker',
      summary: 'Browse every component in the sidebar from one catalog, then narrow the list by H5, Weapp, or dual-target availability.',
      targets: 'Targets',
      weapp: 'Weapp',
    })

const targetCounts = {
  h5: componentCatalogItems.filter(item => item.targets.includes('h5')).length,
  weapp: componentCatalogItems.filter(item => item.targets.includes('weapp')).length,
  dual: componentCatalogItems.filter(item => item.targets.length === 2).length,
}

const filterOptions = computed(() => [
  { id: 'all' as const, label: copy.value.all, count: componentCount },
  { id: 'h5' as const, label: copy.value.h5, count: targetCounts.h5 },
  { id: 'weapp' as const, label: copy.value.weapp, count: targetCounts.weapp },
  { id: 'dual' as const, label: copy.value.dual, count: targetCounts.dual },
])

function matchesTarget(targets: readonly ComponentTarget[]): boolean {
  if (targetFilter.value === 'all') { return true }
  if (targetFilter.value === 'dual') { return targets.length === 2 }
  return targets.includes(targetFilter.value)
}

const groups = computed(() => {
  const search = query.value.trim().toLowerCase()

  return componentCatalog
    .map(group => ({
      id: group.id,
      summary: group.summary[props.locale],
      title: group.title[props.locale],
      items: group.items
        .filter(item => matchesTarget(item.targets))
        .filter((item) => {
          if (!search) { return true }
          return [
            item.id,
            item.name,
            item.label.en,
            item.label.zh,
          ].some(value => value.toLowerCase().includes(search))
        })
        .map(item => ({
          ...item,
          href: withDocsBase(componentDocsRoute(item.id, props.locale)),
          label: item.label[props.locale],
        })),
    }))
    .filter(group => group.items.length > 0)
})

const visibleComponentCount = computed(() =>
  groups.value.reduce((count, group) => count + group.items.length, 0),
)

const hasActiveFilters = computed(() => query.value.trim().length > 0 || targetFilter.value !== 'all')

function targetAvailabilityLabel(targets: readonly ComponentTarget[]): string {
  const names = targets.map(target => target === 'h5' ? copy.value.h5 : copy.value.weapp)
  return `${copy.value.targets}: ${names.join(' + ')}`
}

function resetFilters() {
  query.value = ''
  targetFilter.value = 'all'
}
</script>

<template>
  <div class="component-catalog">
    <header class="component-catalog__intro">
      <div>
        <span>{{ copy.eyebrow }}</span>
        <p>{{ copy.summary }}</p>
      </div>
      <output aria-live="polite">
        <strong>{{ visibleComponentCount }}</strong>
        <template v-if="hasActiveFilters"> {{ copy.of }} {{ componentCount }}</template>
        {{ copy.count }}
      </output>
    </header>

    <div class="component-catalog__toolbar">
      <label class="component-catalog__search" for="component-catalog-search">
        <span class="component-catalog__sr-only">{{ copy.searchLabel }}</span>
        <input
          id="component-catalog-search"
          v-model="query"
          class="component-catalog__search-input"
          type="search"
          name="component-search"
          :placeholder="copy.searchPlaceholder"
          autocomplete="off"
          spellcheck="false"
          @keydown.esc="query = ''"
        >
      </label>

      <div
        class="component-catalog__filters"
        role="group"
        :aria-label="copy.availability"
      >
        <button
          v-for="option in filterOptions"
          :key="option.id"
          type="button"
          :aria-pressed="targetFilter === option.id"
          @click="targetFilter = option.id"
        >
          {{ option.label }}
          <span>{{ option.count }}</span>
        </button>
      </div>
    </div>

    <div v-if="groups.length > 0" class="component-catalog__groups">
      <section v-for="group in groups" :key="group.id" class="component-catalog__group">
        <header>
          <div>
            <h2>{{ group.title }}</h2>
            <p>{{ group.summary }}</p>
          </div>
          <span>{{ group.items.length }}</span>
        </header>

        <div class="component-catalog__links">
          <a
            v-for="item in group.items"
            :key="item.id"
            :href="item.href"
            :aria-label="`${item.name}. ${targetAvailabilityLabel(item.targets)}. ${copy.open}`"
          >
            <span class="component-catalog__identity">
              <strong>{{ item.name }}</strong>
              <small>{{ item.label }}</small>
            </span>
            <span class="component-catalog__targets" aria-hidden="true">
              <small v-for="target in item.targets" :key="target">
                {{ target === 'h5' ? copy.h5 : copy.weapp }}
              </small>
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="none"
            >
              <path d="M5 3h8v8M13 3 3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
        </div>
      </section>
    </div>

    <div v-else class="component-catalog__empty" role="status">
      <strong>{{ copy.empty }}</strong>
      <p>{{ copy.emptyDetail }}</p>
      <button type="button" @click="resetFilters">
        {{ copy.reset }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.component-catalog {
  display: grid;
  gap: 18px;
  margin: 24px 0 40px;
}

.component-catalog__intro {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  justify-content: space-between;
  padding: 18px 20px;
  background: color-mix(in srgb, var(--varo-accent-soft) 56%, var(--varo-card-solid));
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius-lg);
}

.component-catalog__intro > div {
  min-width: 0;
}

.component-catalog__intro span {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--varo-accent);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.component-catalog__intro p {
  max-width: 68ch;
  margin: 7px 0 0;
  line-height: 1.65;
  color: var(--varo-muted);
}

.component-catalog__intro output {
  flex: none;
  font-size: 0.82rem;
  color: var(--varo-muted);
}

.component-catalog__intro output strong {
  font-size: 1rem;
  color: var(--varo-foreground);
}

.component-catalog__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: color-mix(in srgb, var(--varo-card) 82%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius-lg);
}

.component-catalog__search {
  flex: 1 1 280px;
  min-width: 0;
}

.component-catalog__search-input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  font: inherit;
  color: var(--varo-foreground);
  outline: none;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border-strong);
  border-radius: var(--varo-radius);
}

.component-catalog__search-input::placeholder {
  color: var(--varo-placeholder);
}

.component-catalog__search-input:focus-visible {
  border-color: var(--varo-accent);
  box-shadow: 0 0 0 3px var(--varo-ring);
}

.component-catalog__filters {
  display: flex;
  flex: 0 1 auto;
  flex-wrap: wrap;
  gap: 6px;
}

.component-catalog__filters button,
.component-catalog__empty button {
  min-height: 44px;
  padding: 0 11px;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 750;
  color: var(--varo-text-regular);
  cursor: pointer;
  background: var(--varo-surface-strong);
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius);
}

.component-catalog__filters button {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.component-catalog__filters button span {
  font-size: 0.68rem;
  color: var(--varo-muted);
}

.component-catalog__filters button:hover,
.component-catalog__empty button:hover {
  border-color: var(--varo-accent);
}

.component-catalog__filters button:focus-visible,
.component-catalog__empty button:focus-visible {
  outline: 2px solid var(--varo-accent);
  outline-offset: 2px;
}

.component-catalog__filters button[aria-pressed='true'] {
  color: var(--varo-primary-text);
  background: var(--varo-primary-soft);
  border-color: color-mix(in srgb, var(--varo-primary) 64%, var(--varo-border));
}

.component-catalog__filters button[aria-pressed='true'] span {
  color: currentcolor;
}

.component-catalog__groups {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
}

.component-catalog__group {
  min-width: 0;
  padding: 18px;
  background: color-mix(in srgb, var(--varo-card) 82%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius-lg);
}

.component-catalog__group > header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.component-catalog__group h2 {
  padding: 0;
  margin: 0;
  font-size: 1.05rem;
  color: var(--varo-foreground);
  letter-spacing: -0.02em;
  border: 0;
}

.component-catalog__group p {
  margin: 5px 0 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--varo-muted);
}

.component-catalog__group > header > span {
  display: inline-grid;
  flex: none;
  place-items: center;
  min-width: 30px;
  height: 26px;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--varo-muted);
  background: var(--varo-surface-strong);
  border: 1px solid var(--varo-border);
  border-radius: 7px;
}

.component-catalog__links {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
}

.component-catalog__links a {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 16px;
  gap: 9px;
  align-items: center;
  min-width: 0;
  min-height: 68px;
  padding: 9px 11px;
  color: var(--varo-foreground);
  text-decoration: none;
  background: color-mix(in srgb, var(--varo-surface-strong) 72%, transparent);
  border: 1px solid transparent;
  border-radius: var(--varo-radius);
  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease;
}

.component-catalog__links a:hover {
  color: var(--varo-accent);
  background: var(--varo-accent-soft);
  border-color: color-mix(in srgb, var(--varo-accent) 36%, var(--varo-border));
}

.component-catalog__links a:focus-visible {
  outline: 2px solid var(--varo-accent);
  outline-offset: 2px;
}

.component-catalog__identity {
  display: grid;
  min-width: 0;
}

.component-catalog__identity strong {
  font-size: 0.84rem;
  color: inherit;
  overflow-wrap: anywhere;
}

.component-catalog__identity small {
  font-size: 0.72rem;
  color: var(--varo-muted);
}

.component-catalog__targets {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-end;
}

.component-catalog__targets small {
  padding: 2px 5px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.58rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--varo-primary-text);
  background: var(--varo-primary-soft);
  border: 1px solid color-mix(in srgb, var(--varo-primary) 32%, var(--varo-border));
  border-radius: 5px;
}

.component-catalog__links svg {
  flex: none;
  color: var(--varo-muted);
}

.component-catalog__empty {
  display: grid;
  justify-items: start;
  padding: 28px;
  color: var(--varo-foreground);
  background: color-mix(in srgb, var(--varo-card) 82%, transparent);
  border: 1px dashed var(--varo-border-strong);
  border-radius: var(--varo-radius-lg);
}

.component-catalog__empty p {
  margin: 6px 0 16px;
  color: var(--varo-muted);
}

.component-catalog__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
}

@media (max-width: 960px) {
  .component-catalog__links {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .component-catalog__groups {
    grid-template-columns: minmax(0, 1fr);
  }

  .component-catalog__intro {
    flex-direction: column;
    align-items: flex-start;
  }

  .component-catalog__toolbar {
    align-items: stretch;
  }

  .component-catalog__search {
    flex-basis: 100%;
  }
}

@media (max-width: 480px) {
  .component-catalog__group {
    padding: 14px;
  }

  .component-catalog__links {
    grid-template-columns: minmax(0, 1fr);
  }

  .component-catalog__links a {
    grid-template-columns: minmax(0, 1fr) auto 16px;
  }
}
</style>
