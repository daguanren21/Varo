<script setup lang="ts">
import type { BlockCategory, BlockGalleryLocale } from './block-gallery'
import { computed, shallowRef } from 'vue'
import {

  blockGalleryDefinitions,

} from './block-gallery'
import BlockGalleryCard from './BlockGalleryCard.vue'

type CategoryFilter = 'all' | BlockCategory

const { locale = 'zh' } = defineProps<{
  locale?: BlockGalleryLocale
}>()

const query = shallowRef('')
const category = shallowRef<CategoryFilter>('all')
const categoryOptions = computed<{ id: CategoryFilter, label: string }[]>(() => [
  { id: 'all', label: locale === 'zh' ? '全部' : 'All' },
  { id: 'business', label: locale === 'zh' ? '业务基础' : 'Business' },
  { id: 'retail', label: locale === 'zh' ? '零售' : 'Retail' },
  { id: 'agent', label: 'Agent' },
])
const visibleBlocks = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase()
  return blockGalleryDefinitions.filter((block) => {
    if (category.value !== 'all' && block.category !== category.value) { return false }
    if (!keyword) { return true }
    const searchable = [block.id, block.title.zh, block.title.en, block.description.zh, block.description.en]
      .join(' ')
      .toLocaleLowerCase()
    return searchable.includes(keyword)
  })
})
</script>

<template>
  <section class="varo-block-gallery" :aria-label="locale === 'zh' ? '可安装 Blocks 图库' : 'Installable Blocks gallery'">
    <header class="varo-block-gallery__intro">
      <div>
        <p>REGISTRY BLOCKS</p>
        <h2>{{ locale === 'zh' ? '先看界面，再生成源码' : 'See the interface, then generate the source' }}</h2>
        <span>
          {{ locale === 'zh'
            ? '每张卡片都来自真实小程序 Block：Headless 负责状态与交互，Base Kit 负责视觉。确认界面后，复制一条命令即可生成源码和递归依赖。'
            : 'Every card comes from a real mini-program Block: Headless owns state and interaction, while the Base Kit owns visuals. Review the interface, then copy one command to generate the source and recursive dependencies.' }}
        </span>
      </div>
      <strong>{{ blockGalleryDefinitions.length }} BLOCKS</strong>
    </header>

    <div class="varo-block-gallery__toolbar">
      <label class="varo-block-gallery__search">
        <span>{{ locale === 'zh' ? '搜索' : 'Search' }}</span>
        <input v-model="query" type="search" :placeholder="locale === 'zh' ? '搜索 Block 名称或用途' : 'Search by name or use case'">
      </label>
      <div class="varo-block-gallery__filters" role="tablist" :aria-label="locale === 'zh' ? 'Block 分类' : 'Block categories'">
        <button
          v-for="option in categoryOptions"
          :key="option.id"
          type="button"
          role="tab"
          :aria-selected="category === option.id"
          @click="category = option.id"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="varo-block-gallery__result">
      <span>{{ locale === 'zh' ? `显示 ${visibleBlocks.length} 个 Block` : `Showing ${visibleBlocks.length} Blocks` }}</span>
      <small>{{ locale === 'zh' ? '预览图为 Weapp 实际运行界面' : 'Previews are captured from the running Weapp surface' }}</small>
    </div>

    <div v-if="visibleBlocks.length" class="varo-block-gallery__grid">
      <BlockGalleryCard v-for="block in visibleBlocks" :key="block.id" :block="block" :locale="locale" />
    </div>
    <div v-else class="varo-block-gallery__empty" role="status">
      <strong>{{ locale === 'zh' ? '没有匹配的 Block' : 'No matching Blocks' }}</strong>
      <span>{{ locale === 'zh' ? '换一个名称或分类。' : 'Try another name or category.' }}</span>
    </div>
  </section>
</template>

<style scoped>
.varo-block-gallery {
  display: grid;
  gap: 18px;
  margin: 28px 0 36px;
  color: var(--varo-foreground);
}

.varo-block-gallery__intro {
  display: flex;
  gap: 24px;
  align-items: end;
  justify-content: space-between;
}

.varo-block-gallery__intro p {
  margin: 0 0 7px;
  font-size: 11px;
  font-weight: 850;
  color: var(--varo-accent);
  letter-spacing: 0.15em;
}

.varo-block-gallery__intro h2 {
  margin: 0;
  font-size: clamp(24px, 4vw, 34px);
  letter-spacing: -0.035em;
}

.varo-block-gallery__intro span {
  display: block;
  max-width: 64ch;
  margin-top: 9px;
  line-height: 1.7;
  color: var(--varo-muted);
}

.varo-block-gallery__intro > strong {
  flex: none;
  padding-bottom: 4px;
  font-size: 11px;
  color: var(--varo-muted);
  letter-spacing: 0.08em;
}

.varo-block-gallery__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background:
    repeating-linear-gradient(-45deg, transparent, transparent 7px, var(--varo-gridline) 7px, var(--varo-gridline) 8px),
    var(--varo-surface);
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius-lg);
}

.varo-block-gallery__search {
  position: relative;
  flex: 1 1 250px;
}

.varo-block-gallery__search > span {
  position: absolute;
  top: 50%;
  left: 12px;
  font-size: 11px;
  font-weight: 800;
  color: var(--varo-muted);
  transform: translateY(-50%);
}

.varo-block-gallery__search input {
  width: 100%;
  min-height: 40px;
  padding: 0 12px 0 58px;
  font: inherit;
  font-size: 13px;
  color: var(--varo-foreground);
  background: var(--varo-surface);
  border: 1px solid var(--varo-border);
  border-radius: 8px;
}

.varo-block-gallery__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.varo-block-gallery__filters button {
  min-height: 36px;
  padding: 0 11px;
  font: inherit;
  font-size: 12px;
  font-weight: 720;
  color: var(--varo-muted);
  cursor: pointer;
  background: var(--varo-surface);
  border: 1px solid var(--varo-border);
  border-radius: 8px;
}

.varo-block-gallery__filters button[aria-selected='true'] {
  color: var(--varo-primary-foreground);
  background: var(--varo-primary);
  border-color: var(--varo-primary);
}

.varo-block-gallery__result {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  color: var(--varo-muted);
}

.varo-block-gallery__result span {
  font-size: 12px;
  font-weight: 760;
}

.varo-block-gallery__result small {
  font-size: 11px;
}

.varo-block-gallery__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.varo-block-gallery__empty {
  display: grid;
  gap: 5px;
  place-content: center;
  min-height: 180px;
  color: var(--varo-muted);
  text-align: center;
  background: var(--varo-surface);
  border: 1px dashed var(--varo-border-strong);
  border-radius: var(--varo-radius-lg);
}

.varo-block-gallery__empty span {
  font-size: 13px;
}

button:focus-visible,
input:focus-visible {
  outline: 3px solid var(--varo-ring);
  outline-offset: 2px;
}

@media (max-width: 760px) {
  .varo-block-gallery__intro {
    align-items: start;
  }

  .varo-block-gallery__intro > strong,
  .varo-block-gallery__result small {
    display: none;
  }

  .varo-block-gallery__toolbar {
    align-items: stretch;
  }

  .varo-block-gallery__filters {
    width: 100%;
  }

  .varo-block-gallery__grid {
    grid-template-columns: 1fr;
  }
}
</style>
