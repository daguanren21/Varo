// @vitest-environment jsdom
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { compileFunction } from 'node:vm'
import { mount } from '@vue/test-utils'
import ts from 'typescript'
import { describe, it } from 'vitest'
import * as Vue from 'vue'
import { compileScript, parse } from 'vue/compiler-sfc'
import { convertRetailSources } from './convert-retail-vue.mjs'

function sources(extra = []) {
  return new Map([
    ['src/app.vue', `<script setup lang="ts"></script>
<template><view><slot /></view></template>
<style>page { color: black; }</style>
<json>{ "pages": ["pages/retail-home/index"], "window": { "navigationBarTitleText": "Retail" } }</json>`],
    ['src/pages/retail-home/index.vue', '<template><view /></template><json>{ "navigationStyle": "custom" }</json>'],
    ['src/styles.css', '@layer theme, utilities;'],
    ['src/styles/varo.css', 'page { --varo-ui-bg: white; }'],
    ...extra,
  ])
}

function evaluate(source, filename, { dependencies = {}, taroEnv = 'h5' } = {}) {
  const { outputText } = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const module = { exports: {} }
  const require = (name) => {
    if (name === 'vue') { return Vue }
    if (Object.hasOwn(dependencies, name)) { return dependencies[name] }
    throw new Error(`Unexpected runtime dependency: ${name}`)
  }
  compileFunction(outputText, ['require', 'module', 'exports', 'process'])(require, module, module.exports, { env: { TARO_ENV: taroEnv } })
  return module.exports
}

describe.each(['uni-app', 'taro'])('%s source conversion', (framework) => {
  it('keeps uncontrolled defaults, controlled values, named slots and emitted input payloads after removing native guards', async (t) => {
    const filename = 'src/components/field.vue'
    const files = sources([[filename, `<script setup lang="ts">
import { computed, shallowRef } from 'wevu'
defineOptions({ inheritAttrs: false, properties: { value: { type: null, value: '' } } })
const props = withDefaults(defineProps<{ value?: string | number, defaultValue?: string }>(), {
  value: undefined,
  defaultValue: '',
})
const emit = defineEmits<{ 'update:value': [value: string] }>()
const local = shallowRef(props.defaultValue)
const display = computed(() => props.value ?? local.value)
function input(event: { detail: { value: string } }) {
  local.value = event.detail.value
  emit('update:value', local.value)
}
</script>
<template><view><slot name="label" /><input :value="display" @input="input"></view></template>
<json>{ "component": true, "styleIsolation": "apply-shared" }</json>`]])
    convertRetailSources(files, [], framework)
    const { descriptor } = parse(files.get(filename), { filename })
    const component = evaluate(compileScript(descriptor, {
      id: 'converted-field',
      inlineTemplate: true,
      templateOptions: { compilerOptions: { isCustomElement: tag => tag === 'view' } },
    }).content, filename).default
    const wrapper = mount(component, {
      props: { defaultValue: 'saved draft' },
      attrs: { title: 'not forwarded' },
      slots: { label: () => Vue.h('span', 'Delivery note') },
    })
    t.onTestFinished(() => wrapper.unmount())
    assert.equal(wrapper.find('span').text(), 'Delivery note')
    assert.equal(wrapper.attributes('title'), undefined)
    assert.equal(wrapper.find('input').element.value, 'saved draft')

    wrapper.find('input').element.dispatchEvent(new CustomEvent('input', { detail: { value: 'next draft' } }))
    await Vue.nextTick()
    assert.equal(wrapper.find('input').element.value, 'next draft')
    assert.deepEqual(wrapper.emitted('update:value'), [['next draft']])

    await wrapper.setProps({ value: 0 })
    wrapper.find('input').element.dispatchEvent(new CustomEvent('input', { detail: { value: '13' } }))
    await Vue.nextTick()
    assert.equal(wrapper.find('input').element.value, '0')
    assert.deepEqual(wrapper.emitted('update:value'), [['next draft'], ['13']])

    await wrapper.setProps({ value: '' })
    assert.equal(wrapper.find('input').element.value, '')
  })

  it('rejects conflicting native and Vue defaults without publishing partial output or provenance', () => {
    const files = sources([['src/components/count.vue', `<script setup lang="ts">
defineOptions({ properties: { value: { type: null, value: 4 } } })
withDefaults(defineProps<{ value?: number }>(), { value: 2 })
</script><template><text>{{ value }}</text></template>`]])
    const before = new Map(files)
    const transforms = [{ file: 'src/app.vue', operation: 'Collected native routes.' }]
    assert.throws(() => convertRetailSources(files, transforms, framework), /native property value conflicts with its Vue default/)
    assert.deepEqual(files, before)
    assert.deepEqual(transforms, [{ file: 'src/app.vue', operation: 'Collected native routes.' }])
  })

  it('keeps imported branding outside the assets directory available as a real static URL', () => {
    const logo = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" />')
    const files = sources([
      ['src/features/retail/logo.svg', logo],
      ['src/features/retail/config.ts', 'import logo from \'./logo.svg\'\nexport const brand = { logo }\n'],
    ])
    convertRetailSources(files, [], framework)
    const { brand } = evaluate(files.get('src/features/retail/config.ts'), 'config.ts')
    assert.equal(brand.logo, '/static/features/retail/logo.svg')
    assert.equal(files.get(`src${brand.logo}`), logo)
    assert.equal(files.has('src/features/retail/logo.svg'), false)
  })

  it('rejects native APIs without an approved cross-platform meaning rather than replacing the global blindly', () => {
    const files = sources([['src/features/native.ts', 'export function open() { return wx.createCameraContext() }']])
    const before = new Map(files)
    assert.throws(() => convertRetailSources(files, [], framework), /unsupported native API wx.createCameraContext/)
    assert.deepEqual(files, before)
  })

  it('rejects native property observers instead of silently dropping their state transitions', () => {
    const files = sources([['src/components/observed.vue', `<script setup lang="ts">
defineOptions({ properties: { value: { type: null, observer: 'changed' } } })
defineProps<{ value?: string }>()
</script><template><text>{{ value }}</text></template>`]])
    assert.throws(() => convertRetailSources(files, [], framework), /native property value.observer has no Vue conversion/)
  })

  it('activates the focused control once without activating its parent or disabled controls', async (t) => {
    const filename = 'src/components/actions.vue'
    const files = sources([[filename, `<script setup lang="ts">
import { shallowRef } from 'wevu'
const props = defineProps<{ disabled?: boolean, role?: string }>()
const selections = shallowRef(0)
const additions = shallowRef(0)
</script>
<template>
  <view data-interactive="true" :role="props.role" @click="selections++">
    <button :disabled="props.disabled" @click.stop="additions++">Add</button>
    <output>{{ selections }}:{{ additions }}</output>
  </view>
</template>`]])
    convertRetailSources(files, [], framework)
    const { descriptor } = parse(files.get(filename), { filename })
    const component = evaluate(compileScript(descriptor, {
      id: 'converted-actions',
      inlineTemplate: true,
      templateOptions: { compilerOptions: { isCustomElement: tag => tag === 'view' } },
    }).content, filename).default
    const wrapper = mount(component)
    t.onTestFinished(() => wrapper.unmount())
    const card = wrapper.find('view')
    const button = wrapper.find('button')
    assert.equal(card.attributes('role'), 'button')
    assert.equal(button.attributes('tabindex'), '0')

    await button.trigger('keydown', { key: ' ' })
    assert.equal(wrapper.find('output').text(), '0:1')
    await button.trigger('keydown', { key: ' ', repeat: true })
    assert.equal(wrapper.find('output').text(), '0:1')
    await card.trigger('keydown', { key: 'Enter' })
    assert.equal(wrapper.find('output').text(), '1:1')

    await wrapper.setProps({ disabled: true })
    assert.equal(button.attributes('tabindex'), '-1')
    assert.equal(button.attributes('aria-disabled'), 'true')
    await button.trigger('keydown', { key: 'Enter' })
    assert.equal(wrapper.find('output').text(), '1:1')
    await wrapper.setProps({ disabled: false })
    assert.equal(button.attributes('aria-disabled'), 'false')
    await button.trigger('keydown', { key: ' ' })
    assert.equal(wrapper.find('output').text(), '1:2')
  })

  it('keeps supplied false distinct from absence and releases Vue lifecycle work on unmount', async () => {
    const filename = 'src/components/toggle.vue'
    const files = sources([[filename, `<script setup lang="ts">
import { computed, onUnmounted, shallowRef } from 'wevu'
defineOptions({ properties: { open: { type: null, value: null } } })
const props = withDefaults(defineProps<{ open?: boolean, defaultOpen?: boolean }>(), { open: undefined, defaultOpen: true })
const emit = defineEmits<{ change: [value: boolean], release: [] }>()
const local = shallowRef(props.defaultOpen)
const current = computed(() => props.open ?? local.value)
onUnmounted(() => emit('release'))
function toggle() { local.value = !current.value; emit('change', local.value) }
</script><template><button @tap="toggle">{{ current }}</button></template>`]])
    convertRetailSources(files, [], framework)
    const { descriptor } = parse(files.get(filename), { filename })
    const component = evaluate(compileScript(descriptor, { id: 'toggle', inlineTemplate: true }).content, filename).default
    const wrapper = mount(component)
    assert.equal(wrapper.text(), 'true')
    await wrapper.setProps({ open: false })
    assert.equal(wrapper.text(), 'false')
    await wrapper.find('button').trigger(framework === 'taro' ? 'click' : 'tap')
    assert.equal(wrapper.text(), 'false')
    assert.deepEqual(wrapper.emitted('change'), [[true]])
    await wrapper.setProps({ open: undefined })
    assert.equal(wrapper.text(), 'true')
    wrapper.unmount()
    assert.deepEqual(wrapper.emitted('release'), [[]])
  })
})

it('rejects a Taro page-config collision atomically rather than replacing caller-owned configuration', () => {
  const files = sources([['src/pages/retail-home/index.config.ts', 'export default { navigationBarTitleText: \"Owned\" }']])
  const before = new Map(files)
  const transforms = []
  assert.throws(() => convertRetailSources(files, transforms, 'taro'), /converted path collision/)
  assert.deepEqual(files, before)
  assert.deepEqual(transforms, [])
})

it('rejects native isolated component semantics Taro cannot preserve', () => {
  const files = sources([['src/components/isolated.vue', '<template><view /></template><json>{ \"component\": true, \"styleIsolation\": \"isolated\" }</json>']])
  const before = new Map(files)
  assert.throws(() => convertRetailSources(files, [], 'taro'), /cannot preserve component option styleIsolation/)
  assert.deepEqual(files, before)
})

it.each(['h5', 'weapp'])('preserves route text and shared options across Taro %s load hooks', (taroEnv) => {
  const filename = 'src/route.ts'
  const files = sources([[filename, `import { onLoad as load, onLoad as anotherLoad } from 'wevu'
export const received: Record<string, unknown>[] = []
load(options => { received.push(options) })
anotherLoad(options => { received.push(options) })
`]])
  convertRetailSources(files, [], 'taro')
  const listeners = []
  const result = evaluate(files.get(filename), filename, {
    taroEnv,
    dependencies: { '@tarojs/taro': { useLoad: listener => listeners.push(listener) } },
  })
  const expected = { keyword: '连衣裙', percent: '%2F', plus: '+', reserved: 'a&b=c?#', malformed: '100%', stamp: 9 }
  const incoming = Object.freeze(taroEnv === 'h5'
    ? { keyword: '%E8%BF%9E%E8%A1%A3%E8%A3%99', percent: '%252F', plus: '%2B', reserved: 'a%26b%3Dc%3F%23', malformed: '100%', stamp: 9 }
    : { ...expected })
  listeners[0](incoming)
  assert.deepEqual(result.received[0], expected)
  // Another hook sees the same SDK-owned object, not the first hook's decoded copy.
  listeners[1](incoming)
  assert.equal(result.received[1].percent, '%2F')
  assert.equal(incoming.percent, taroEnv === 'h5' ? '%252F' : '%2F')
})
