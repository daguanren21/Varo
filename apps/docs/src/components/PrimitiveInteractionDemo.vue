<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  ButtonRoot,
  CheckboxIndicator,
  CheckboxRoot,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogRoot,
  DialogTrigger,
  InputRoot,
  OverlayRoot,
  PopupRoot,
  PopoverClose,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  RadioGroup,
  RadioIndicator,
  RadioItem,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  StickyRoot,
  SwitchRoot,
  SwitchThumb,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger
} from '@varo/primitives-h5'
import type { SelectOption, SelectPrimitiveValue } from '@varo/primitives-h5'

type Locale = 'zh' | 'en'
type StageId = 'foundation' | 'selection' | 'disclosure' | 'layers'
type CopyState = 'idle' | 'copied' | 'unsupported'

interface PartSnippet {
  name: string
  note: string
  code: string
}

const props = withDefaults(
  defineProps<{
    locale?: Locale
  }>(),
  {
    locale: 'zh'
  }
)

const activeStage = shallowRef<StageId>('foundation')
const dialogOpen = shallowRef(false)
const overlayVisible = shallowRef(false)
const popupVisible = shallowRef(false)
const inputValue = shallowRef('Varo primitives')
const buttonClicks = shallowRef(0)
const accordionValue = shallowRef<string | string[] | undefined>('foundation')
const checkboxChecked = shallowRef(false)
const collapsibleOpen = shallowRef(false)
const popoverOpen = shallowRef(false)
const radioValue = shallowRef('h5')
const selectValue = shallowRef<SelectPrimitiveValue>(undefined)
const switchChecked = shallowRef(false)
const tabsValue = shallowRef('foundation')
const copyState = shallowRef<CopyState>('idle')
const lastCopied = shallowRef('')
let copyFeedbackTimer: number | undefined

const selectOptions = [
  { label: 'Starter', value: 'starter' },
  { label: 'Base Kit', value: 'base-kit' },
  { disabled: true, label: 'Business Wrapper', value: 'business-wrapper' }
] satisfies SelectOption[]

const copy = computed(() =>
  props.locale === 'zh'
    ? {
        kicker: 'Primitives',
        title: '交互工作台',
        caption: '按开发路径分组。左侧试交互，右侧复制 part 最小示例；样式留给 wrapper。',
        stages: {
          foundation: '基础控件',
          selection: '选择与切换',
          disclosure: '展开与浮层',
          layers: '遮罩与弹层'
        },
        stageTitle: '交互分组',
        foundationIntro: '入口控件与受控写入。',
        selectionIntro: 'Root 持有 value / checked；Indicator / Thumb 只渲染。',
        disclosureIntro: '先 open 契约，再动画与定位。',
        layersIntro: 'Root 管 open，Overlay 管遮罩，Content 管内容。',
        railTitle: '可复制 Parts',
        liveTitle: '当前状态',
        copyPart: '复制',
        copied: '已复制',
        copyManually: '手动复制',
        canvasHint: '主画布',
        button: 'ButtonRoot',
        buttonAction: '点击',
        clicked: '次',
        input: 'InputRoot',
        sticky: 'StickyRoot',
        stickyHint: '滚动时观察 data-fixed',
        checkbox: 'CheckboxRoot',
        checkboxLabel: '启用跨端状态',
        radio: 'RadioGroup',
        radioH5: 'H5',
        radioWeapp: '小程序',
        switch: 'SwitchRoot',
        select: 'SelectRoot',
        selectGroup: 'Base Kit',
        tabs: 'TabsRoot',
        tabsFoundation: '基座',
        tabsBlocks: 'Blocks',
        tabsFoundationBody: '可复用交互状态。',
        tabsBlocksBody: '产品布局叠加同一契约。',
        collapsible: 'CollapsibleRoot',
        collapsibleAction: '展开高级设置',
        collapsiblePanel: '筛选项 / 详情 / 高级字段',
        accordion: 'AccordionRoot',
        accordionFoundation: '状态与事件',
        accordionFoundationBody: 'data-state · ARIA · 受控 value',
        accordionWrapper: '动画与布局',
        accordionWrapperBody: 'token · 图标 · 过渡',
        popover: 'PopoverRoot',
        popoverAction: '打开 Popover',
        popoverPanel: '轻量浮层内容',
        dialog: 'DialogRoot',
        dialogAction: '打开 Dialog',
        dialogBody: '触发器 · 遮罩 · 内容 · 关闭',
        overlay: 'OverlayRoot',
        overlayAction: '显示 Overlay',
        popup: 'PopupRoot',
        popupAction: '打开 Popup',
        popupBody: '弹出层 · 遮罩 · 关闭',
        close: '关闭',
        on: '开',
        off: '关'
      }
    : {
        kicker: 'Primitives',
        title: 'Interaction workbench',
        caption: 'Grouped by developer path. Try interactions on the left; copy minimal part snippets on the right. Leave styles to wrappers.',
        stages: {
          foundation: 'Foundation',
          selection: 'Selection',
          disclosure: 'Disclosure',
          layers: 'Layers'
        },
        stageTitle: 'Stage groups',
        foundationIntro: 'Entry controls and controlled writes.',
        selectionIntro: 'Roots own value / checked; indicators and thumbs only render.',
        disclosureIntro: 'Learn the open contract before animation or positioning.',
        layersIntro: 'Root owns open, Overlay owns the mask, Content owns the surface.',
        railTitle: 'Copyable parts',
        liveTitle: 'Live state',
        copyPart: 'Copy',
        copied: 'Copied',
        copyManually: 'Copy manually',
        canvasHint: 'Canvas',
        button: 'ButtonRoot',
        buttonAction: 'Press',
        clicked: 'fires',
        input: 'InputRoot',
        sticky: 'StickyRoot',
        stickyHint: 'Watch data-fixed while scrolling',
        checkbox: 'CheckboxRoot',
        checkboxLabel: 'Enable cross-runtime state',
        radio: 'RadioGroup',
        radioH5: 'H5',
        radioWeapp: 'Weapp',
        switch: 'SwitchRoot',
        select: 'SelectRoot',
        selectGroup: 'Base Kit',
        tabs: 'TabsRoot',
        tabsFoundation: 'Foundation',
        tabsBlocks: 'Blocks',
        tabsFoundationBody: 'Reusable interaction state.',
        tabsBlocksBody: 'Product layout on the same contract.',
        collapsible: 'CollapsibleRoot',
        collapsibleAction: 'Expand advanced settings',
        collapsiblePanel: 'Filters / details / advanced fields',
        accordion: 'AccordionRoot',
        accordionFoundation: 'State & events',
        accordionFoundationBody: 'data-state · ARIA · controlled value',
        accordionWrapper: 'Motion & layout',
        accordionWrapperBody: 'tokens · icons · transitions',
        popover: 'PopoverRoot',
        popoverAction: 'Open Popover',
        popoverPanel: 'Lightweight floating content',
        dialog: 'DialogRoot',
        dialogAction: 'Open Dialog',
        dialogBody: 'Trigger · overlay · content · close',
        overlay: 'OverlayRoot',
        overlayAction: 'Show Overlay',
        popup: 'PopupRoot',
        popupAction: 'Open Popup',
        popupBody: 'Popup · mask · close',
        close: 'Close',
        on: 'On',
        off: 'Off'
      }
)

const stages = computed(() =>
  (['foundation', 'selection', 'disclosure', 'layers'] as const).map((id) => ({
    id,
    label: copy.value.stages[id]
  }))
)

const stageIntro = computed(() => {
  switch (activeStage.value) {
    case 'selection':
      return copy.value.selectionIntro
    case 'disclosure':
      return copy.value.disclosureIntro
    case 'layers':
      return copy.value.layersIntro
    default:
      return copy.value.foundationIntro
  }
})

const liveBadges = computed(() => {
  switch (activeStage.value) {
    case 'selection':
      return [
        { label: 'checkbox', value: checkboxChecked.value ? copy.value.on : copy.value.off, tone: checkboxChecked.value ? 'on' : 'off' },
        { label: 'radio', value: radioValue.value, tone: 'info' },
        { label: 'switch', value: switchChecked.value ? copy.value.on : copy.value.off, tone: switchChecked.value ? 'on' : 'off' },
        { label: 'select', value: String(selectValue.value ?? '—'), tone: 'info' },
        { label: 'tabs', value: tabsValue.value, tone: 'info' }
      ]
    case 'disclosure':
      return [
        { label: 'collapsible', value: collapsibleOpen.value ? copy.value.on : copy.value.off, tone: collapsibleOpen.value ? 'on' : 'off' },
        { label: 'accordion', value: String(accordionValue.value ?? '—'), tone: 'info' },
        { label: 'popover', value: popoverOpen.value ? copy.value.on : copy.value.off, tone: popoverOpen.value ? 'on' : 'off' }
      ]
    case 'layers':
      return [
        { label: 'dialog', value: dialogOpen.value ? copy.value.on : copy.value.off, tone: dialogOpen.value ? 'on' : 'off' },
        { label: 'overlay', value: overlayVisible.value ? copy.value.on : copy.value.off, tone: overlayVisible.value ? 'on' : 'off' },
        { label: 'popup', value: popupVisible.value ? copy.value.on : copy.value.off, tone: popupVisible.value ? 'on' : 'off' }
      ]
    default:
      return [
        { label: 'clicks', value: String(buttonClicks.value), tone: 'info' },
        { label: 'input', value: inputValue.value || '—', tone: 'info' }
      ]
  }
})

const partSnippets = computed((): PartSnippet[] => {
  const pkg = '@varo/primitives-h5'
  switch (activeStage.value) {
    case 'selection':
      return [
        {
          name: 'CheckboxRoot',
          note: 'v-model:checked',
          code: `import { CheckboxRoot, CheckboxIndicator } from '${pkg}'\n\n<CheckboxRoot v-model:checked="checked">\n  <CheckboxIndicator>✓</CheckboxIndicator>\n  Label\n</CheckboxRoot>`
        },
        {
          name: 'RadioGroup',
          note: 'v-model:value',
          code: `import { RadioGroup, RadioItem, RadioIndicator } from '${pkg}'\n\n<RadioGroup v-model:value="value">\n  <RadioItem value="h5">\n    <RadioIndicator>•</RadioIndicator>\n    H5\n  </RadioItem>\n</RadioGroup>`
        },
        {
          name: 'SwitchRoot',
          note: 'v-model:checked',
          code: `import { SwitchRoot, SwitchThumb } from '${pkg}'\n\n<SwitchRoot v-model:checked="on">\n  <SwitchThumb />\n</SwitchRoot>`
        },
        {
          name: 'SelectRoot',
          note: 'options + parts',
          code: `import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from '${pkg}'\n\n<SelectRoot v-model:value="value" :options="options">\n  <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>\n  <SelectContent>\n    <SelectItem :option="options[0]">{{ options[0].label }}</SelectItem>\n  </SelectContent>\n</SelectRoot>`
        },
        {
          name: 'TabsRoot',
          note: 'v-model:value',
          code: `import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '${pkg}'\n\n<TabsRoot v-model:value="tab">\n  <TabsList>\n    <TabsTrigger value="a">A</TabsTrigger>\n  </TabsList>\n  <TabsContent value="a">Panel A</TabsContent>\n</TabsRoot>`
        }
      ]
    case 'disclosure':
      return [
        {
          name: 'CollapsibleRoot',
          note: 'v-model:open',
          code: `import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from '${pkg}'\n\n<CollapsibleRoot v-model:open="open">\n  <CollapsibleTrigger>Toggle</CollapsibleTrigger>\n  <CollapsibleContent>Details</CollapsibleContent>\n</CollapsibleRoot>`
        },
        {
          name: 'AccordionRoot',
          note: 'type=single',
          code: `import { AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent } from '${pkg}'\n\n<AccordionRoot v-model:value="value" type="single" collapsible>\n  <AccordionItem value="one">\n    <AccordionTrigger>One</AccordionTrigger>\n    <AccordionContent>Body</AccordionContent>\n  </AccordionItem>\n</AccordionRoot>`
        },
        {
          name: 'PopoverRoot',
          note: 'v-model:open',
          code: `import { PopoverRoot, PopoverTrigger, PopoverContent, PopoverClose } from '${pkg}'\n\n<PopoverRoot v-model:open="open">\n  <PopoverTrigger>Open</PopoverTrigger>\n  <PopoverContent>\n    Content\n    <PopoverClose>Close</PopoverClose>\n  </PopoverContent>\n</PopoverRoot>`
        }
      ]
    case 'layers':
      return [
        {
          name: 'DialogRoot',
          note: 'overlay + content',
          code: `import { DialogRoot, DialogTrigger, DialogOverlay, DialogContent, DialogClose } from '${pkg}'\n\n<DialogRoot v-model:open="open">\n  <DialogTrigger>Open</DialogTrigger>\n  <DialogOverlay />\n  <DialogContent>\n    Body\n    <DialogClose>Close</DialogClose>\n  </DialogContent>\n</DialogRoot>`
        },
        {
          name: 'OverlayRoot',
          note: 'visible + click',
          code: `import { OverlayRoot } from '${pkg}'\n\n<OverlayRoot\n  :visible="visible"\n  @update:visible="visible = $event"\n  @click="visible = false"\n/>`
        },
        {
          name: 'PopupRoot',
          note: 'visible slot',
          code: `import { PopupRoot } from '${pkg}'\n\n<PopupRoot :visible="visible" @update:visible="visible = $event">\n  <template #default>\n    Body\n    <button type="button" @click="visible = false">Close</button>\n  </template>\n</PopupRoot>`
        }
      ]
    default:
      return [
        {
          name: 'ButtonRoot',
          note: 'press events',
          code: `import { ButtonRoot } from '${pkg}'\n\n<ButtonRoot @click="onPress">\n  Press\n</ButtonRoot>`
        },
        {
          name: 'InputRoot',
          note: 'v-model:value',
          code: `import { InputRoot } from '${pkg}'\n\n<InputRoot\n  :value="value"\n  @update:value="value = $event"\n/>`
        },
        {
          name: 'StickyRoot',
          note: 'fixed slot prop',
          code: `import { StickyRoot } from '${pkg}'\n\n<StickyRoot :offset-top="8">\n  <template #default="{ fixed }">\n    sticky · data-fixed={{ fixed }}\n  </template>\n</StickyRoot>`
        }
      ]
  }
})

function resetCopyState() {
  if (copyFeedbackTimer) {
    window.clearTimeout(copyFeedbackTimer)
    copyFeedbackTimer = undefined
  }
  copyState.value = 'idle'
  lastCopied.value = ''
}

async function copyPart(part: PartSnippet) {
  if (!navigator?.clipboard?.writeText) {
    copyState.value = 'unsupported'
    lastCopied.value = part.name
    return
  }

  await navigator.clipboard.writeText(part.code)
  copyState.value = 'copied'
  lastCopied.value = part.name
  copyFeedbackTimer = window.setTimeout(() => {
    copyState.value = 'idle'
    lastCopied.value = ''
    copyFeedbackTimer = undefined
  }, 1600)
}

function partCopyLabel(name: string) {
  if (lastCopied.value === name && copyState.value === 'copied') {
    return copy.value.copied
  }
  if (lastCopied.value === name && copyState.value === 'unsupported') {
    return copy.value.copyManually
  }
  return copy.value.copyPart
}

onBeforeUnmount(() => resetCopyState())
</script>

<template>
  <section class="primitive-demo" aria-label="Primitive interaction demo">
    <header class="primitive-demo__head">
      <div>
        <span class="primitive-demo__kicker">{{ copy.kicker }}</span>
        <h2>{{ copy.title }}</h2>
        <p>{{ copy.caption }}</p>
      </div>
    </header>

    <div class="primitive-demo__tabs" role="tablist" :aria-label="copy.stageTitle">
      <button
        v-for="stage in stages"
        :key="stage.id"
        type="button"
        role="tab"
        :aria-selected="activeStage === stage.id"
        :data-active="activeStage === stage.id"
        @click="activeStage = stage.id; resetCopyState()"
      >
        {{ stage.label }}
      </button>
    </div>

    <div class="primitive-demo__stage" role="tabpanel">
      <div class="primitive-demo__stage-bar">
        <p class="primitive-demo__stage-intro">{{ stageIntro }}</p>
        <div class="primitive-demo__live" :aria-label="copy.liveTitle">
          <span
            v-for="badge in liveBadges"
            :key="badge.label"
            class="primitive-demo__badge"
            :data-tone="badge.tone"
          >
            <em>{{ badge.label }}</em>
            <strong>{{ badge.value }}</strong>
          </span>
        </div>
      </div>

      <div class="primitive-demo__workspace">
        <div class="primitive-demo__canvas" :aria-label="copy.canvasHint">
          <template v-if="activeStage === 'foundation'">
            <article class="primitive-demo__panel">
              <header class="primitive-demo__panel-head">
                <code>{{ copy.button }}</code>
                <small>{{ buttonClicks }} {{ copy.clicked }}</small>
              </header>
              <ButtonRoot class="primitive-demo__button" @click="buttonClicks += 1">
                {{ copy.buttonAction }}
              </ButtonRoot>
            </article>

            <article class="primitive-demo__panel">
              <header class="primitive-demo__panel-head">
                <code>{{ copy.input }}</code>
              </header>
              <InputRoot
                class="primitive-demo__input"
                :value="inputValue"
                @update:value="inputValue = $event"
              />
            </article>

            <article class="primitive-demo__panel primitive-demo__panel--wide">
              <header class="primitive-demo__panel-head">
                <code>{{ copy.sticky }}</code>
                <small>{{ copy.stickyHint }}</small>
              </header>
              <StickyRoot class="primitive-demo__sticky" :offset-top="8">
                <template #default="{ fixed }">
                  <strong>{{ copy.sticky }}</strong>
                  <small>data-fixed={{ fixed }}</small>
                </template>
              </StickyRoot>
            </article>
          </template>

          <template v-else-if="activeStage === 'selection'">
            <article class="primitive-demo__panel">
              <header class="primitive-demo__panel-head">
                <code>{{ copy.checkbox }}</code>
              </header>
              <CheckboxRoot v-model:checked="checkboxChecked" class="primitive-demo__choice">
                <CheckboxIndicator class="primitive-demo__choice-mark">v</CheckboxIndicator>
                <span class="primitive-demo__choice-text">{{ copy.checkboxLabel }}</span>
              </CheckboxRoot>
            </article>

            <article class="primitive-demo__panel">
              <header class="primitive-demo__panel-head">
                <code>{{ copy.radio }}</code>
              </header>
              <RadioGroup v-model:value="radioValue" class="primitive-demo__radio-group">
                <RadioItem value="h5" class="primitive-demo__choice">
                  <RadioIndicator class="primitive-demo__choice-mark">•</RadioIndicator>
                  <span class="primitive-demo__choice-text">{{ copy.radioH5 }}</span>
                </RadioItem>
                <RadioItem value="weapp" class="primitive-demo__choice">
                  <RadioIndicator class="primitive-demo__choice-mark">•</RadioIndicator>
                  <span class="primitive-demo__choice-text">{{ copy.radioWeapp }}</span>
                </RadioItem>
              </RadioGroup>
            </article>

            <article class="primitive-demo__panel">
              <header class="primitive-demo__panel-head">
                <code>{{ copy.switch }}</code>
              </header>
              <SwitchRoot v-model:checked="switchChecked" class="primitive-demo__switch">
                <SwitchThumb class="primitive-demo__switch-thumb" />
              </SwitchRoot>
            </article>

            <article class="primitive-demo__panel">
              <header class="primitive-demo__panel-head">
                <code>{{ copy.select }}</code>
              </header>
              <SelectRoot v-model:value="selectValue" :options="selectOptions">
                <SelectTrigger class="primitive-demo__select-trigger">
                  <SelectValue placeholder="Starter / Base Kit" />
                </SelectTrigger>
                <SelectContent class="primitive-demo__select-content">
                  <SelectGroup>
                    <SelectLabel class="primitive-demo__select-label">{{ copy.selectGroup }}</SelectLabel>
                    <SelectItem
                      v-for="option in selectOptions"
                      :key="option.value"
                      class="primitive-demo__select-item"
                      :option="option"
                    >
                      {{ option.label }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </SelectRoot>
            </article>

            <article class="primitive-demo__panel primitive-demo__panel--wide">
              <header class="primitive-demo__panel-head">
                <code>{{ copy.tabs }}</code>
              </header>
              <TabsRoot v-model:value="tabsValue" class="primitive-demo__tabs-root">
                <TabsList class="primitive-demo__tabs-list">
                  <TabsTrigger value="foundation" class="primitive-demo__tabs-trigger">
                    {{ copy.tabsFoundation }}
                  </TabsTrigger>
                  <TabsTrigger value="blocks" class="primitive-demo__tabs-trigger">
                    {{ copy.tabsBlocks }}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="foundation" class="primitive-demo__panel-surface">
                  {{ copy.tabsFoundationBody }}
                </TabsContent>
                <TabsContent value="blocks" class="primitive-demo__panel-surface">
                  {{ copy.tabsBlocksBody }}
                </TabsContent>
              </TabsRoot>
            </article>
          </template>

          <template v-else-if="activeStage === 'disclosure'">
            <article class="primitive-demo__panel">
              <header class="primitive-demo__panel-head">
                <code>{{ copy.collapsible }}</code>
              </header>
              <CollapsibleRoot v-model:open="collapsibleOpen" class="primitive-demo__collapsible">
                <CollapsibleTrigger class="primitive-demo__button">
                  {{ copy.collapsibleAction }}
                </CollapsibleTrigger>
                <CollapsibleContent class="primitive-demo__panel-surface">
                  {{ copy.collapsiblePanel }}
                </CollapsibleContent>
              </CollapsibleRoot>
            </article>

            <article class="primitive-demo__panel">
              <header class="primitive-demo__panel-head">
                <code>{{ copy.accordion }}</code>
              </header>
              <AccordionRoot
                v-model:value="accordionValue"
                class="primitive-demo__accordion"
                type="single"
                collapsible
              >
                <AccordionItem value="foundation" class="primitive-demo__accordion-item">
                  <AccordionTrigger class="primitive-demo__accordion-trigger">
                    {{ copy.accordionFoundation }}
                  </AccordionTrigger>
                  <AccordionContent class="primitive-demo__panel-surface">
                    {{ copy.accordionFoundationBody }}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="wrapper" class="primitive-demo__accordion-item">
                  <AccordionTrigger class="primitive-demo__accordion-trigger">
                    {{ copy.accordionWrapper }}
                  </AccordionTrigger>
                  <AccordionContent class="primitive-demo__panel-surface">
                    {{ copy.accordionWrapperBody }}
                  </AccordionContent>
                </AccordionItem>
              </AccordionRoot>
            </article>

            <article class="primitive-demo__panel primitive-demo__panel--wide">
              <header class="primitive-demo__panel-head">
                <code>{{ copy.popover }}</code>
              </header>
              <PopoverRoot v-model:open="popoverOpen">
                <PopoverTrigger class="primitive-demo__button">
                  {{ copy.popoverAction }}
                </PopoverTrigger>
                <PopoverContent class="primitive-demo__popover">
                  <p>{{ copy.popoverPanel }}</p>
                  <PopoverClose class="primitive-demo__layer-close">{{ copy.close }}</PopoverClose>
                </PopoverContent>
              </PopoverRoot>
            </article>
          </template>

          <template v-else>
            <article class="primitive-demo__panel">
              <header class="primitive-demo__panel-head">
                <code>{{ copy.dialog }}</code>
              </header>
              <DialogRoot v-model:open="dialogOpen">
                <DialogTrigger class="primitive-demo__button">
                  {{ copy.dialogAction }}
                </DialogTrigger>
                <DialogOverlay class="primitive-demo__overlay" />
                <DialogContent class="primitive-demo__dialog">
                  <p>{{ copy.dialogBody }}</p>
                  <DialogClose class="primitive-demo__layer-close">{{ copy.close }}</DialogClose>
                </DialogContent>
              </DialogRoot>
            </article>

            <article class="primitive-demo__panel">
              <header class="primitive-demo__panel-head">
                <code>{{ copy.overlay }}</code>
              </header>
              <ButtonRoot class="primitive-demo__button" @click="overlayVisible = true">
                {{ copy.overlayAction }}
              </ButtonRoot>
              <OverlayRoot
                class="primitive-demo__overlay"
                :visible="overlayVisible"
                @update:visible="overlayVisible = $event"
                @click="overlayVisible = false"
              />
            </article>

            <article class="primitive-demo__panel">
              <header class="primitive-demo__panel-head">
                <code>{{ copy.popup }}</code>
              </header>
              <ButtonRoot class="primitive-demo__button" @click="popupVisible = true">
                {{ copy.popupAction }}
              </ButtonRoot>
              <PopupRoot
                class="primitive-demo__popup"
                :visible="popupVisible"
                @update:visible="popupVisible = $event"
              >
                <template #default>
                  <p>{{ copy.popupBody }}</p>
                  <button class="primitive-demo__layer-close" type="button" @click="popupVisible = false">
                    {{ copy.close }}
                  </button>
                </template>
              </PopupRoot>
            </article>
          </template>
        </div>

        <aside class="primitive-demo__rail" :aria-label="copy.railTitle">
          <div class="primitive-demo__rail-head">
            <strong>{{ copy.railTitle }}</strong>
            <span>{{ partSnippets.length }}</span>
          </div>
          <ul class="primitive-demo__part-list">
            <li v-for="part in partSnippets" :key="part.name" class="primitive-demo__part-item">
              <div class="primitive-demo__part-meta">
                <code>{{ part.name }}</code>
                <small>{{ part.note }}</small>
              </div>
              <button
                type="button"
                class="primitive-demo__copy"
                :data-state="lastCopied === part.name ? copyState : 'idle'"
                :aria-label="`${partCopyLabel(part.name)} ${part.name}`"
                @click="copyPart(part)"
              >
                {{ partCopyLabel(part.name) }}
              </button>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.primitive-demo {
  --primitive-surface: var(--varo-demo-surface);
  --primitive-surface-strong: var(--varo-demo-surface-strong);
  --primitive-border: var(--varo-demo-border);
  --primitive-shadow: var(--varo-demo-shadow);
  container-type: inline-size;
  container-name: primitive-demo;
  display: grid;
  gap: 12px;
  margin: 20px 0 36px;
}

.primitive-demo__head {
  display: grid;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--primitive-border);
}

.primitive-demo__head h2 {
  margin: 2px 0 4px;
  color: var(--varo-foreground);
  font-size: clamp(22px, 2.6vw, 30px);
  line-height: 1.15;
}

.primitive-demo__head p {
  margin: 0;
  max-width: 68ch;
  color: var(--varo-muted);
  font-size: 13px;
  line-height: 1.55;
}

.primitive-demo__kicker {
  color: var(--varo-demo-brand);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.primitive-demo__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.primitive-demo__tabs button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  border: 1px solid var(--primitive-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--primitive-surface-strong) 92%, transparent);
  color: var(--varo-foreground);
  padding: 0 12px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
}

.primitive-demo__tabs button:hover:not([data-active='true']) {
  border-color: color-mix(in srgb, var(--varo-primary) 42%, var(--primitive-border));
  background: color-mix(in srgb, var(--varo-primary) 8%, var(--primitive-surface-strong));
}

.primitive-demo__tabs button[data-active='true'] {
  border-color: transparent;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: var(--varo-primary-foreground);
  box-shadow: 0 8px 18px color-mix(in srgb, var(--vp-c-brand-1) 28%, transparent);
}

.primitive-demo__tabs button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--varo-primary) 70%, transparent);
  outline-offset: 2px;
}

.primitive-demo__stage {
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--primitive-border);
  border-radius: var(--varo-demo-radius);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--primitive-surface) 94%, transparent), var(--primitive-surface-strong)),
    radial-gradient(circle at top right, color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent), transparent 36%);
  box-shadow: var(--primitive-shadow);
}

.primitive-demo__stage-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 10px;
  border-bottom: 1px solid var(--varo-border);
}

.primitive-demo__stage-intro {
  margin: 0;
  max-width: 48ch;
  color: var(--varo-muted);
  font-size: 13px;
  line-height: 1.45;
}

.primitive-demo__live {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  max-width: 56%;
}

.primitive-demo__badge {
  display: inline-flex;
  min-height: 26px;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  border: 1px solid var(--varo-border);
  border-radius: 999px;
  background: var(--varo-card-solid);
  color: var(--varo-foreground);
  font-size: 11px;
  line-height: 1;
}

.primitive-demo__badge em {
  color: var(--varo-muted);
  font-style: normal;
  font-weight: 650;
}

.primitive-demo__badge strong {
  font-weight: 720;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.primitive-demo__badge[data-tone='on'] {
  border-color: color-mix(in srgb, #16a34a 42%, var(--varo-border));
  background: color-mix(in srgb, #16a34a 12%, var(--varo-card-solid));
  color: color-mix(in srgb, #166534 70%, var(--varo-foreground));
}

.primitive-demo__badge[data-tone='off'] {
  border-color: var(--varo-border);
  color: var(--varo-muted);
}

.primitive-demo__badge[data-tone='info'] {
  border-color: color-mix(in srgb, var(--varo-primary) 28%, var(--varo-border));
  background: color-mix(in srgb, var(--varo-primary) 8%, var(--varo-card-solid));
}

.primitive-demo__workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 240px);
  gap: 12px;
  align-items: start;
}

.primitive-demo__canvas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  min-width: 0;
}

.primitive-demo__panel {
  display: grid;
  gap: 10px;
  align-content: start;
  min-height: 112px;
  padding: 12px;
  border: 1px solid var(--primitive-border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--primitive-surface-strong) 92%, transparent);
  box-shadow: 0 10px 24px color-mix(in srgb, var(--varo-foreground) 8%, transparent);
}

.primitive-demo__panel--wide {
  grid-column: 1 / -1;
}

.primitive-demo__panel-head {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.primitive-demo__panel-head code {
  color: var(--varo-foreground);
  font-size: 12px;
  font-weight: 740;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.primitive-demo__panel-head small,
.primitive-demo__panel small {
  color: var(--varo-muted);
  font-size: 12px;
}

.primitive-demo__rail {
  display: grid;
  gap: 8px;
  align-content: start;
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--primitive-border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--primitive-surface-strong) 90%, transparent);
}

.primitive-demo__rail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--varo-border);
}

.primitive-demo__rail-head strong {
  color: var(--varo-foreground);
  font-size: 12px;
  font-weight: 740;
}

.primitive-demo__rail-head span {
  color: var(--varo-muted);
  font-size: 11px;
  font-weight: 700;
}

.primitive-demo__part-list {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.primitive-demo__part-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius);
  background: var(--varo-card-solid);
}

.primitive-demo__part-meta {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.primitive-demo__part-meta code {
  overflow: hidden;
  color: var(--varo-foreground);
  font-size: 11px;
  font-weight: 720;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.primitive-demo__part-meta small {
  color: var(--varo-muted);
  font-size: 11px;
}

.primitive-demo__copy {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--varo-primary) 28%, var(--varo-border));
  border-radius: var(--varo-radius);
  background: color-mix(in srgb, var(--varo-primary) 10%, var(--varo-card-solid));
  color: var(--varo-primary);
  padding: 0 10px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease;
}

.primitive-demo__copy:hover {
  border-color: var(--varo-primary);
  background: color-mix(in srgb, var(--varo-primary) 16%, var(--varo-card-solid));
}

.primitive-demo__copy:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--varo-primary) 70%, transparent);
  outline-offset: 2px;
}

.primitive-demo__copy[data-state='copied'] {
  border-color: color-mix(in srgb, #16a34a 48%, var(--varo-border));
  background: color-mix(in srgb, #16a34a 14%, var(--varo-card-solid));
  color: #15803d;
}

.primitive-demo__copy[data-state='unsupported'] {
  border-color: color-mix(in srgb, #d97706 48%, var(--varo-border));
  background: color-mix(in srgb, #d97706 12%, var(--varo-card-solid));
  color: #b45309;
}

.primitive-demo__button,
.primitive-demo__input,
.primitive-demo__layer-close,
.primitive-demo__select-trigger,
.primitive-demo__accordion-trigger {
  min-height: 36px;
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius);
  background: var(--varo-card-solid);
  color: var(--varo-foreground);
  font: inherit;
  font-size: 13px;
}

.primitive-demo__button,
.primitive-demo__layer-close,
.primitive-demo__select-trigger,
.primitive-demo__accordion-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
}

.primitive-demo__button:hover,
.primitive-demo__layer-close:hover,
.primitive-demo__select-trigger:hover,
.primitive-demo__accordion-trigger:hover {
  border-color: color-mix(in srgb, var(--varo-primary) 42%, var(--varo-border));
  background: color-mix(in srgb, var(--varo-primary) 8%, var(--varo-card-solid));
}

.primitive-demo__button:focus-visible,
.primitive-demo__layer-close:focus-visible,
.primitive-demo__select-trigger:focus-visible,
.primitive-demo__accordion-trigger:focus-visible,
.primitive-demo__input:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--varo-primary) 70%, transparent);
  outline-offset: 2px;
}

.primitive-demo__button {
  background: color-mix(in srgb, var(--varo-primary) 10%, var(--varo-card-solid));
  border-color: color-mix(in srgb, var(--varo-primary) 28%, var(--varo-border));
  color: var(--varo-primary);
  font-weight: 650;
}

.primitive-demo__input {
  width: 100%;
  padding: 0 12px;
}

.primitive-demo__choice {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 10px;
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius);
  background: var(--varo-card-solid);
  cursor: pointer;
}

.primitive-demo__choice-mark {
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--varo-border-strong);
  border-radius: 4px;
  color: var(--varo-primary);
  font-size: 12px;
  font-weight: 700;
}

.primitive-demo__choice-text {
  color: var(--varo-foreground);
  font-size: 13px;
}

.primitive-demo__radio-group {
  display: grid;
  gap: 8px;
}

.primitive-demo__switch {
  position: relative;
  display: inline-flex;
  width: 44px;
  height: 26px;
  align-items: center;
  border: 1px solid var(--varo-border);
  border-radius: 999px;
  background: var(--varo-card-muted);
  padding: 0 3px;
  cursor: pointer;
}

.primitive-demo__switch[data-state='checked'] {
  background: color-mix(in srgb, var(--varo-primary) 24%, var(--varo-card-muted));
  border-color: color-mix(in srgb, var(--varo-primary) 42%, var(--varo-border));
}

.primitive-demo__switch-thumb {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--varo-card-solid);
  box-shadow: var(--varo-shadow-sm);
  transition: transform 160ms ease;
}

.primitive-demo__switch[data-state='checked'] .primitive-demo__switch-thumb {
  transform: translateX(18px);
}

.primitive-demo__select-trigger {
  width: 100%;
  justify-content: space-between;
}

.primitive-demo__select-content {
  z-index: 30;
  min-width: 180px;
  margin-top: 6px;
  padding: 6px;
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius-lg);
  background: var(--varo-card-solid);
  box-shadow: var(--varo-shadow-popover);
}

.primitive-demo__select-label {
  display: block;
  padding: 6px 8px;
  color: var(--varo-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.primitive-demo__select-item {
  display: flex;
  min-height: 32px;
  align-items: center;
  border-radius: var(--varo-radius);
  padding: 0 8px;
  color: var(--varo-foreground);
  font-size: 13px;
  cursor: pointer;
}

.primitive-demo__select-item:hover,
.primitive-demo__select-item[data-highlighted='true'],
.primitive-demo__select-item[data-state='checked'] {
  background: color-mix(in srgb, var(--varo-primary) 12%, transparent);
  color: var(--varo-primary);
}

.primitive-demo__select-item[data-disabled='true'] {
  color: var(--varo-muted);
  cursor: not-allowed;
}

.primitive-demo__tabs-root {
  display: grid;
  gap: 10px;
}

.primitive-demo__tabs-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.primitive-demo__tabs-trigger {
  min-height: 32px;
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius);
  background: var(--varo-card-solid);
  color: var(--varo-muted);
  padding: 0 12px;
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.primitive-demo__tabs-trigger[data-state='active'] {
  border-color: var(--varo-primary);
  background: color-mix(in srgb, var(--varo-primary) 12%, var(--varo-card-solid));
  color: var(--varo-primary);
}

.primitive-demo__panel-surface {
  padding: 10px 12px;
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius);
  background: var(--varo-card-muted);
  color: var(--varo-muted);
  font-size: 13px;
  line-height: 1.55;
}

.primitive-demo__collapsible,
.primitive-demo__accordion {
  display: grid;
  gap: 8px;
}

.primitive-demo__accordion-item {
  display: grid;
  gap: 8px;
}

.primitive-demo__accordion-trigger {
  width: 100%;
  justify-content: space-between;
}

.primitive-demo__popover,
.primitive-demo__dialog,
.primitive-demo__popup {
  display: grid;
  gap: 12px;
  min-width: min(280px, 100%);
  padding: 14px;
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius-lg);
  background: var(--varo-card-solid);
  box-shadow: var(--varo-shadow-popover);
  color: var(--varo-foreground);
}

.primitive-demo__overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--varo-bg) 20%, rgb(0 0 0 / 42%));
}

.primitive-demo__dialog,
.primitive-demo__popup {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 50;
  transform: translate(-50%, -50%);
}

.primitive-demo__sticky {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius);
  background: var(--varo-card-solid);
}

.primitive-demo__sticky small {
  color: var(--varo-muted);
}

@container primitive-demo (max-width: 720px) {
  .primitive-demo__workspace {
    grid-template-columns: 1fr;
  }

  .primitive-demo__live {
    max-width: 100%;
    justify-content: flex-start;
  }

  .primitive-demo__stage-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}

@container primitive-demo (max-width: 520px) {
  .primitive-demo__canvas {
    grid-template-columns: 1fr;
  }

  .primitive-demo__panel--wide {
    grid-column: auto;
  }
}

@supports not (container-type: inline-size) {
  @media (max-width: 720px) {
    .primitive-demo__workspace {
      grid-template-columns: 1fr;
    }

    .primitive-demo__live {
      max-width: 100%;
      justify-content: flex-start;
    }

    .primitive-demo__stage-bar {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: 520px) {
    .primitive-demo__canvas {
      grid-template-columns: 1fr;
    }
  }
}
</style>
