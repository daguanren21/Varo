import { describe, expect, it } from 'vitest'
import { normalizeWevuCaptureAttributes, scanCss, scanWxml } from '../src/plugin/source-scanners.ts'

describe('native artifact source scanning', () => {
  it('ignores template-looking strings inside comments and WXS scripts', () => {
    const source = `<!-- <ghost-component /> -->
<wxs module="helpers">var text = '<also-not-a-component />';</wxs>
<view><v-input value="{{ value }}" /></view>`
    expect(scanWxml(source).tags).toEqual(['wxs', 'view', 'v-input'])
  })

  it('collects real CSS resources without treating quoted content as imports', () => {
    const source = `/* @import 'private.wxss'; */
@import './base.wxss';
.value { content: "url(secret.png)"; background: url('./icon.png'); }`
    const scanned = scanCss(source)
    expect(scanned.imports.map(item => item.specifier)).toEqual(['./base.wxss'])
    expect(scanned.urls.map(item => item.specifier)).toEqual(['./icon.png'])
  })
})

describe('Wevu capture attribute normalization', () => {
  it('removes identical captures while preserving both handlers and their original quoting', () => {
    const source = `<v-input bindchange="__wv_change" data-wv-s0="{{__wvSlotPropsData}}" bindblur='__wv_blur' data-wv-s0='{{__wvSlotPropsData}}' data-wv-i12="{{index}}" bindfocus="__wv_focus" data-wv-i12="{{index}}" />`
    expect(normalizeWevuCaptureAttributes(source)).toBe(`<v-input bindchange="__wv_change" data-wv-s0="{{__wvSlotPropsData}}" bindblur='__wv_blur'  data-wv-i12="{{index}}" bindfocus="__wv_focus"  />`)
  })

  it('keeps capture ownership local to each element', () => {
    const source = '<view data-wv-s0="{{outer}}"><view data-wv-s0="{{inner}}" /></view>'
    expect(normalizeWevuCaptureAttributes(source)).toBe(source)
  })

  it.each(['data-wv-s0', 'data-wv-i12'])('rejects conflicting values for %s', (name) => {
    expect(() => normalizeWevuCaptureAttributes(`<view ${name}="{{first}}" ${name}="{{second}}" />`))
      .toThrow(`Conflicting Wevu capture attribute ${name} on <view>`)
  })

  it('compares raw capture values without decoding entities or trimming expressions', () => {
    expect(() => normalizeWevuCaptureAttributes(`<view data-wv-s0='{{&quot;item&quot;}}' data-wv-s0='{{"item"}}' />`))
      .toThrow('Conflicting Wevu capture attribute data-wv-s0')
    expect(() => normalizeWevuCaptureAttributes('<view data-wv-i0="{{index}}" data-wv-i0="{{ index }}" />'))
      .toThrow('Conflicting Wevu capture attribute data-wv-i0')
  })

  it.each([
    '<view class="same" class="same" />',
    '<view bindtap="first" bindtap="second" />',
    '<view data-wv-slot="same" data-wv-slot="same" />',
    '<view data-wv-s0-extra="same" data-wv-s0-extra="same" />',
    '<view DATA-WV-S0="same" DATA-WV-S0="same" />',
    '<view data-wv-s0 data-wv-s0 />',
  ])('leaves ordinary or non-valued duplicates untouched: %s', (source) => {
    expect(normalizeWevuCaptureAttributes(source)).toBe(source)
  })

  it('preserves comments, CDATA, inline WXS and attribute-looking text verbatim', () => {
    const prefix = `<!-- <view data-wv-s0="one" data-wv-s0="two" /> -->
<![CDATA[<view data-wv-i0="one" data-wv-i0="two" />]]>
<wxs module="helpers">var html = '<view data-wv-s0="one" data-wv-s0="two" />';</wxs>
`
    const tag = `<view title='data-wv-s0="one" data-wv-s0="two" >' data-wv-s0="{{item}}" data-wv-s0="{{item}}" />`
    expect(normalizeWevuCaptureAttributes(prefix + tag)).toBe(`${prefix}<view title='data-wv-s0="one" data-wv-s0="two" >' data-wv-s0="{{item}}"  />`)
  })

  it('preserves dependency and asset scan results', () => {
    const source = `<import src="../shared/cases.wxml" />
<include src="./details.wxml" />
<wxs module="helpers" src="../shared/helpers.wxs" />
<image src="../../assets/example.png?size=2" style="background: url('../tile.png')" data-wv-s0="{{item}}" data-wv-s0="{{item}}" />`
    const scanned = scanWxml(source)
    expect(scanWxml(normalizeWevuCaptureAttributes(source))).toEqual(scanned)
    expect(scanned.assets).toEqual(['../../assets/example.png?size=2', '../tile.png'])
    expect(scanned.dependencies).toEqual([
      { kind: 'template', specifier: '../shared/cases.wxml' },
      { kind: 'template', specifier: './details.wxml' },
      { kind: 'script', specifier: '../shared/helpers.wxs' },
    ])
  })
})
