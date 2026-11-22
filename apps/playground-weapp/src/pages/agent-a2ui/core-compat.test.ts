// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'

it('loads and processes Core messages when the host lacks Object.hasOwn', () => {
  const session = new URL('./components/session.ts', import.meta.url).href
  const output = execFileSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict'
    delete Object.hasOwn
    const { createA2uiSession, A2UI_CATALOG_ID } = await import(${JSON.stringify(session)})
    let view
    const session = createA2uiSession({onSurfaces(views) { view = views[0] }, onAction() {}})
    try {
      session.receive({version:'1.0',createSurface:{surfaceId:'surface',catalogId:A2UI_CATALOG_ID,
        components:[{id:'root',component:'Text',text:'Ready'}]}})
      assert.equal(view.root.text, 'Ready')
      const symbol = Symbol('key')
      assert.equal(Object.hasOwn({[symbol]:true},symbol),true)
      assert.equal(Object.hasOwn(Object.create({inherited:1}),'inherited'),false)
      assert.throws(()=>Object.hasOwn(null,'x'),TypeError)
      console.log('ready')
    } finally { session.dispose() }
  `], { encoding: 'utf8', cwd: fileURLToPath(new URL('../../..', import.meta.url)) })
  expect(output.trim()).toBe('ready')
})
