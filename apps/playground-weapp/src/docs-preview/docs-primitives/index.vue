<script setup lang="ts">
import type { AccordionValue } from '@varo-ui/headless'
import { computed, shallowRef } from 'wevu'
import DocsDemoPage from '../../components/DocsDemoPage.vue'
import VInputNumber from '../../components/ui/input-number.vue'
import VSelect from '../../components/ui/select.vue'
import VButton from '../../components/ui/v-button.vue'
import VCellGroup from '../../components/ui/v-cell-group.vue'
import VCell from '../../components/ui/v-cell.vue'
import VCheckbox from '../../components/ui/v-checkbox.vue'
import VCollapseItem from '../../components/ui/v-collapse-item.vue'
import VCollapse from '../../components/ui/v-collapse.vue'
import VDialogClose from '../../components/ui/v-dialog-close.vue'
import VDialogContent from '../../components/ui/v-dialog-content.vue'
import VDialogOverlay from '../../components/ui/v-dialog-overlay.vue'
import VDialogRoot from '../../components/ui/v-dialog-root.vue'
import VDialogTrigger from '../../components/ui/v-dialog-trigger.vue'
import VIcon from '../../components/ui/v-icon.vue'
import VImage from '../../components/ui/v-image.vue'
import VInput from '../../components/ui/v-input.vue'
import VOverlay from '../../components/ui/v-overlay.vue'
import VPopoverClose from '../../components/ui/v-popover-close.vue'
import VPopoverContent from '../../components/ui/v-popover-content.vue'
import VPopoverRoot from '../../components/ui/v-popover-root.vue'
import VPopoverTrigger from '../../components/ui/v-popover-trigger.vue'
import VPopup from '../../components/ui/v-popup.vue'
import VRadioGroup from '../../components/ui/v-radio-group.vue'
import VRadio from '../../components/ui/v-radio.vue'
import VSticky from '../../components/ui/v-sticky.vue'
import VSwitch from '../../components/ui/v-switch.vue'
import VTab from '../../components/ui/v-tab.vue'
import VTabs from '../../components/ui/v-tabs.vue'
import { useDocsDemo } from '../../lib/docs-demo'
import imageSource from '../assets/logo.png?url'

const { component, theme } = useDocsDemo('button')
// PrimitiveExamplePreview uses the same English example copy in both locales.
const buttonClicks = shallowRef(0)
const inputValue = shallowRef('Editable primitive')
const numberValue = shallowRef(2)
const dialogOpen = shallowRef(false)
const overlayVisible = shallowRef(false)
const popupVisible = shallowRef(false)
const cellClicks = shallowRef(0)
const cellDescription = computed(() => `${cellClicks.value} activations`)
const checkboxChecked = shallowRef(false)
const radioValue = shallowRef<string | number>('h5')
const switchChecked = shallowRef(false)
const tabsValue = shallowRef<string | number>('a')
const selectValue = shallowRef<string | number | (string | number)[] | undefined>(undefined)
const selectOptions = [
  { label: 'Starter', value: 'starter' },
  { label: 'Base Kit', value: 'base-kit' },
]
const collapsibleValue = shallowRef<AccordionValue>([])
const accordionValue = shallowRef<AccordionValue>('one')
const popoverOpen = shallowRef(false)
const stickyFixed = shallowRef(false)
const popoverCaretClass = computed(() => popoverOpen.value ? 'rotate-180' : '')

const chipClass = '!inline-flex !min-h-[36px] !items-center !gap-2 !rounded-full !border !border-solid !border-[var(--varo-ui-border)] !bg-[var(--varo-ui-surface)] !px-3 !py-0 !text-[13px] !font-[650] !leading-normal !text-[var(--varo-ui-text)] !shadow-none'
const triggerClass = `${chipClass} !min-h-[42px] !w-full !justify-between !px-[14px]`
const panelClass = 'rounded-[14px] border border-solid border-[var(--varo-ui-border)] bg-[var(--varo-ui-surface)] p-3'
const collapseClass = '!grid !gap-2 !overflow-visible !rounded-none !border-0 !bg-transparent'

function updateAccordion(value: AccordionValue) {
  // Keep an empty single selection controlled at the native optional-prop boundary.
  accordionValue.value = value ?? ''
}
</script>

<template>
  <DocsDemoPage :component="component" :theme="theme">
    <view class="docs-primitives grid gap-[10px]" :data-name="component" data-platform="weapp">
      <view v-if="component === 'button'" data-docs-case="button">
        <VButton :class-name="chipClass" tone="default" variant="outline" shape="round" @click="buttonClicks += 1">
          Pressed {{ buttonClicks }} times
        </VButton>
      </view>

      <view v-else-if="component === 'input'" data-docs-case="input">
        <VInput v-model:value="inputValue" class-name="docs-primitive-input" placeholder="Type a value" />
      </view>

      <view v-else-if="component === 'number-field'" data-docs-case="number-field">
        <VInputNumber
          v-model:value="numberValue"
          :min="0"
          :max="5"
          decrease-aria-label="Decrease"
          increase-aria-label="Increase"
          input-aria-label="Value"
        />
      </view>

      <view v-else-if="component === 'dialog'" data-docs-case="dialog">
        <VDialogRoot v-model:open="dialogOpen">
          <VDialogTrigger :class-name="chipClass">
            Open dialog
          </VDialogTrigger>
          <VDialogOverlay class-name="!bg-black/[0.58]" />
          <VDialogContent class-name="!grid !w-[calc(100vw-32px)] !max-w-[360px] !gap-3 !rounded-2xl !border !border-solid !border-[var(--varo-ui-border)] !p-5 !text-left">
            <text class="font-bold">
              Dialog content
            </text>
            <text class="text-[var(--varo-ui-text-muted)]">
              Root owns open state; Overlay and Content only render it.
            </text>
            <VDialogClose :class-name="chipClass">
              Close
            </VDialogClose>
          </VDialogContent>
        </VDialogRoot>
      </view>

      <view v-else-if="component === 'overlay'" class="grid gap-2" data-docs-case="overlay">
        <VButton :class-name="chipClass" tone="default" variant="outline" shape="round" @click="overlayVisible = true">
          Show overlay
        </VButton>
        <VOverlay v-model:visible="overlayVisible" class-name="fixed inset-0 z-[90] grid place-items-center bg-black/[0.58]">
          <VButton
            class-name="!min-h-[52px] !w-[calc(100vw-32px)] !max-w-[360px] !rounded-2xl !border !border-solid !border-[var(--varo-ui-border)] !bg-[var(--varo-ui-surface)] !p-5 !text-[var(--varo-ui-text)]"
            tone="default"
            variant="outline"
            @click="overlayVisible = false"
          >
            Close overlay
          </VButton>
        </VOverlay>
      </view>

      <view v-else-if="component === 'popup'" class="grid gap-2" data-docs-case="popup">
        <VButton :class-name="chipClass" tone="default" variant="outline" shape="round" @click="popupVisible = true">
          Open popup
        </VButton>
        <VPopup v-model:visible="popupVisible" class-name="docs-primitive-popup" position="bottom" round closeable>
          <view class="grid gap-2">
            <text class="font-bold">
              Popup content
            </text>
            <text class="text-[var(--varo-ui-text-muted)]">
              Position, overlay dismiss, and close state share one contract.
            </text>
          </view>
        </VPopup>
      </view>

      <view v-else-if="component === 'image'" data-docs-case="image">
        <VImage
          :src="imageSource"
          alt="Varo runtime mark"
          fit="contain"
          :width="96"
          :height="96"
          :radius="18"
          loading-text="Loading"
          error-text="Unable to load"
        />
      </view>

      <view v-else-if="component === 'sticky'" data-docs-case="sticky">
        <VSticky
          :offset-top="8"
          class-name="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-solid border-[var(--varo-ui-border)] bg-[var(--varo-ui-surface)] px-[14px]"
          @change="stickyFixed = $event"
        >
          <text class="font-bold">
            StickyRoot
          </text>
          <text class="text-xs text-[var(--varo-ui-text-muted)]">
            data-fixed={{ stickyFixed }}
          </text>
        </VSticky>
      </view>

      <view v-else-if="component === 'cell'" data-docs-case="cell">
        <VCellGroup class-name="overflow-hidden rounded-[14px] border border-solid border-[var(--varo-ui-border)] bg-[var(--varo-ui-surface)]" title="Settings">
          <VCell
            class-name="!min-h-[58px] !px-[14px] !py-0"
            title="Notifications"
            sub-title="Primitive row"
            :desc="cellDescription"
            clickable
            is-link
            @click="cellClicks += 1"
          />
        </VCellGroup>
      </view>

      <view v-else-if="component === 'checkbox'" data-docs-case="checkbox">
        <VCheckbox v-model:checked="checkboxChecked" label="Enable state" />
      </view>

      <view v-else-if="component === 'radio-group'" data-docs-case="radio-group">
        <VRadioGroup v-model:value="radioValue" class-name="!grid !gap-2">
          <VRadio :class-name="chipClass" value="h5" label="H5" />
          <VRadio :class-name="chipClass" value="weapp" label="Weapp" />
        </VRadioGroup>
      </view>

      <view v-else-if="component === 'switch'" data-docs-case="switch">
        <VSwitch v-model="switchChecked" size="lg" />
      </view>

      <view v-else-if="component === 'tabs'" data-docs-case="tabs">
        <VTabs v-model:active="tabsValue">
          <VTab name="a" title="A">
            <view :class="panelClass">
              Panel A
            </view>
          </VTab>
          <VTab name="b" title="B">
            <view :class="panelClass">
              Panel B
            </view>
          </VTab>
        </VTabs>
      </view>

      <view v-else-if="component === 'select'" data-docs-case="select">
        <VSelect v-model:value="selectValue" :options="selectOptions" placeholder="Pick a layer" />
      </view>

      <view v-else-if="component === 'collapsible'" data-docs-case="collapsible">
        <VCollapse v-model:value="collapsibleValue" :class-name="collapseClass" collapsible>
          <VCollapseItem class-name="docs-primitive-collapsible" value="details" title="Toggle details">
            <view :class="panelClass">
              Hidden content becomes visible when open.
            </view>
          </VCollapseItem>
        </VCollapse>
      </view>

      <view v-else-if="component === 'accordion'" data-docs-case="accordion">
        <VCollapse :value="accordionValue" :class-name="collapseClass" accordion collapsible @update:value="updateAccordion">
          <VCollapseItem :class-name="panelClass" value="one" title="One">
            Body one
          </VCollapseItem>
          <VCollapseItem :class-name="panelClass" value="two" title="Two">
            Body two
          </VCollapseItem>
        </VCollapse>
      </view>

      <view v-else-if="component === 'popover'" data-docs-case="popover">
        <VOverlay v-model:visible="popoverOpen" class-name="fixed inset-0 z-[39] bg-transparent" />
        <VPopoverRoot v-model:open="popoverOpen" class-name="!relative !z-40 !grid !w-full">
          <VPopoverTrigger :class-name="triggerClass">
            <text>Open</text>
            <VIcon name="chevronDown" :size="14" :class-name="popoverCaretClass" />
          </VPopoverTrigger>
          <VPopoverContent class-name="!top-[calc(100%+10px)] !grid !w-full !max-w-none !gap-2 !rounded-[14px] !px-3 !pb-3 !pt-[14px]" align="start">
            <view class="absolute -top-[6px] right-[18px] h-3 w-3 rotate-45 rounded-tl-[3px] border-l border-t border-solid border-[var(--varo-ui-border)] bg-[var(--varo-ui-surface)]" aria-hidden="true" />
            <text class="text-[13px] leading-normal">
              Lightweight floating content
            </text>
            <VPopoverClose :class-name="chipClass">
              Close
            </VPopoverClose>
          </VPopoverContent>
        </VPopoverRoot>
      </view>
    </view>
  </DocsDemoPage>
</template>

<style>
/* Native controls without part-class props keep their geometry local to this example page. */
.docs-primitives .docs-primitive-input .varo-input__body {
  min-height: 40px;
  border-radius: 10px;
  box-shadow: none;
}

.docs-primitives .varo-input-number {
  display: grid;
  grid-template-columns: 36px minmax(72px, 104px) 36px;
  gap: 8px;
  width: 192px;
  overflow: visible;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.docs-primitives .varo-input-number .varo-input-number__minus,
.docs-primitives .varo-input-number .varo-input-number__plus {
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border);
  border-radius: 999px;
}

.docs-primitives .varo-input-number .varo-input-number__input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--varo-ui-border);
  border-radius: 10px;
}

.docs-primitives .docs-primitive-popup .varo-popup__overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgb(0 0 0 / 58%);
}

.docs-primitives .docs-primitive-popup .varo-popup__content {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 91;
  box-sizing: border-box;
  max-width: 560px;
  padding: 24px;
  margin: auto;
  color: var(--varo-ui-text);
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border);
  border-radius: 20px 20px 0 0;
  box-shadow: var(--varo-ui-shadow-md);
}

.docs-primitives .docs-primitive-popup .varo-popup__close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  place-items: center;
  min-width: 32px;
  min-height: 32px;
  color: var(--varo-ui-text);
  background: var(--varo-ui-fill-light);
  border: 1px solid var(--varo-ui-border);
  border-radius: 999px;
}

.docs-primitives .varo-image {
  box-sizing: border-box;
  display: grid;
  place-items: center;
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border);
}

.docs-primitives .varo-image__img {
  width: 72px;
  height: 72px;
}

.docs-primitives .varo-cell-group__header {
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 750;
  color: var(--varo-ui-text-muted);
  background: var(--varo-ui-fill-light);
  border-bottom: 1px solid var(--varo-ui-border);
}

.docs-primitives .varo-cell__subtitle,
.docs-primitives .varo-cell__desc {
  font-size: 12px;
}

.docs-primitives .varo-checkbox.varo-checkbox {
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 650;
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border);
  border-radius: 999px;
}

.docs-primitives .varo-switch.varo-switch {
  --varo-switch-height: 30px;
  --varo-switch-thumb-travel: 22px;
}

.docs-primitives .varo-tabs {
  gap: 8px;
}

.docs-primitives .varo-tabs .varo-tabs__nav {
  gap: 8px;
  border: 0;
}

.docs-primitives .varo-tabs .varo-tabs__tab {
  flex: none;
  min-width: 0;
  min-height: 36px;
  padding: 0 12px;
  margin: 0;
  font-size: 13px;
  font-weight: 650;
  color: var(--varo-ui-text);
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border);
  border-radius: 999px;
}

.docs-primitives .varo-select__trigger {
  box-sizing: border-box;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 650;
  border-radius: 999px;
}

.docs-primitives .varo-select__panel {
  top: calc(100% + 10px);
  padding: 14px 12px 12px;
}

.docs-primitives .varo-select__panel::before {
  right: 18px;
  left: auto;
}

.docs-primitives .varo-select__options {
  gap: 8px;
}

.docs-primitives .varo-select .varo-select__option {
  min-height: 36px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 650;
  color: var(--varo-ui-text);
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border);
}

.docs-primitives .varo-collapse-item__trigger.varo-collapse-item__trigger {
  justify-content: flex-start;
  width: auto;
  min-height: 36px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 650;
  color: var(--varo-ui-text);
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border);
  border-radius: 999px;
}

.docs-primitives .varo-collapse-item__chevron {
  display: none;
}

.docs-primitives .varo-collapse-item__content {
  padding: 0;
  font-size: inherit;
  color: var(--varo-ui-text);
}

.docs-primitives .docs-primitive-collapsible .varo-collapse-item__content {
  margin-top: 8px;
}
</style>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationStyle": "custom",
  "usingComponents": {}
}
</json>
