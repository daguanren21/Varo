import { describe, expect, it } from 'vitest'
import { scanCss, scanWxml } from '../src/plugin/source-scanners.ts'

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
