import assert from 'node:assert/strict'
import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { appRoot, fixtureItems, getProject, readJson } from './project.mjs'

function inside(root, path) {
  const pathFromRoot = relative(root, path)
  assert(pathFromRoot !== '..' && !pathFromRoot.startsWith(`..${sep}`), `Artifact reference escapes output: ${path}`)
  return path
}

function componentBase(outputRoot, ownerBase, reference) {
  assert.equal(typeof reference, 'string', `Invalid component reference in ${ownerBase}`)
  assert(!reference.includes('://'), `Fixture component must be packaged locally: ${reference}`)
  return inside(outputRoot, reference.startsWith('/')
    ? resolve(outputRoot, `.${reference}`)
    : resolve(dirname(ownerBase), reference))
}

async function requireFile(path) {
  assert((await stat(path)).isFile(), `Expected artifact file: ${path}`)
}

async function walk(root) {
  const files = []
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = resolve(root, entry.name)
    if (entry.isDirectory()) { files.push(...await walk(path)) }
    else if (entry.isFile()) { files.push(path) }
  }
  return files
}

async function readStyles(path, outputRoot, extension, visited = new Set()) {
  inside(outputRoot, path)
  if (visited.has(path)) { return '' }
  visited.add(path)
  const source = await readFile(path, 'utf8')
  assert(!/@(?:tailwind|theme|source)\b/.test(source), `Uncompiled Tailwind directive in ${path}`)
  let result = source
  const imports = source.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/g)
  for (const [, reference] of imports) {
    assert(!reference.includes('://'), `Unexpected remote fixture style: ${reference}`)
    assert.equal(extname(reference), `.${extension}`, `Wrong target style import in ${path}: ${reference}`)
    const imported = reference.startsWith('/')
      ? resolve(outputRoot, `.${reference}`)
      : resolve(dirname(path), reference)
    result += await readStyles(imported, outputRoot, extension, visited)
  }
  return result
}

function assertNativeBinding(markup, tag, event, platform, file) {
  const elements = markup.match(new RegExp(`<${tag}\\b(?:[^"'>]|"[^"]*"|'[^']*')*>`, 'g'))
  assert(elements, `Missing native ${tag} in ${file}`)
  const eventName = platform.wxml.eventBindingStyle === 'alipay'
    ? `(?:on|catch)${event[0].toUpperCase()}${event.slice(1)}`
    : `(?:bind|catch):?${event}`
  const binding = new RegExp(`\\s${eventName}\\s*=\\s*(?:"[^"]+"|'[^']+')`)
  assert(elements.some(element => binding.test(element)), `Missing native ${event} binding on ${tag} in ${file}`)
}

export async function verifyProject(project) {
  const { profile, platform, outputRoot, ideRoot } = project
  const { wxml: markupExtension, wxss: styleExtension } = platform.outputExtensions
  const app = await readJson(resolve(outputRoot, 'app.json'))
  await requireFile(resolve(outputRoot, 'app.js'))
  assert.deepEqual(app.pages, ['pages/index/index'], 'The interactive fixture page must be the app entry')
  const queue = app.pages.map(page => inside(outputRoot, resolve(outputRoot, page)))
  const templates = new Map()
  while (queue.length) {
    const base = queue.shift()
    if (templates.has(base)) { continue }
    const config = await readJson(`${base}.json`)
    await requireFile(`${base}.js`)
    const markup = await readFile(`${base}.${markupExtension}`, 'utf8')
    templates.set(base, markup)
    const tags = new Set([...markup.matchAll(/<([A-Z][\w-]*)\b/gi)].map(match => match[1]))
    const components = { ...app.usingComponents, ...config.usingComponents }
    for (const [name, reference] of Object.entries(components)) {
      if (tags.has(name)) { queue.push(componentBase(outputRoot, base, reference)) }
    }
    for (const [name, generic] of Object.entries(config.componentGenerics ?? {})) {
      if (tags.has(name) && typeof generic === 'object' && generic?.default) {
        queue.push(componentBase(outputRoot, base, generic.default))
      }
    }
    for (const [, prefix] of markup.matchAll(/\s(wx|a|tt|xhs):(?:if|elif|else|for|key)(?:\s|=)/g)) {
      assert.equal(prefix, platform.wxml.directivePrefix, `Wrong target directive in ${base}.${markupExtension}`)
    }
  }

  for (const item of [...fixtureItems, 'form-item', 'icon']) {
    const base = resolve(outputRoot, 'components/ui', `v-${item}`)
    assert(templates.has(base), `The entry page does not reach installed ${item} through usingComponents`)
    const config = await readJson(`${base}.json`)
    assert.equal(config.component, true, `${item} must be emitted as a native component`)
  }
  const markupFor = item => templates.get(resolve(outputRoot, 'components/ui', `v-${item}`))
  assertNativeBinding(markupFor('input'), 'input', 'input', platform, 'v-input')
  assertNativeBinding(markupFor('input-otp'), 'input', 'input', platform, 'v-input-otp')
  assertNativeBinding(markupFor('form'), 'form', 'submit', platform, 'v-form')
  for (const item of ['button', 'checkbox', 'switch']) {
    assertNativeBinding(markupFor(item), 'button', 'tap', platform, `v-${item}`)
  }
  assert(markupFor('drawer').includes(`${platform.wxml.directivePrefix}:if`), 'Drawer visibility must remain a native conditional')
  assert(markupFor('input-otp').includes(`${platform.wxml.directivePrefix}:for`), 'OTP cells must remain a native loop')

  const styles = await readStyles(resolve(outputRoot, `app.${styleExtension}`), outputRoot, styleExtension)
  for (const item of [...fixtureItems, 'form-item', 'icon']) {
    assert(new RegExp(`\\.varo-${item}(?=[\\s.{:#\\[])`).test(styles), `App style closure is missing .varo-${item}`)
  }
  assert(/--varo-ui-primary\s*:/.test(styles), 'App style closure is missing canonical theme tokens')
  assert(/\.flex\s*\{[^}]*display\s*:\s*flex/.test(styles), 'Fixture Tailwind utilities were not compiled')
  const extensions = new Set(['.wxml', '.axml', '.ttml', '.xhsml', '.wxss', '.acss', '.ttss', '.css'])
  const allowed = new Set([`.${markupExtension}`, `.${styleExtension}`])
  for (const path of await walk(outputRoot)) {
    if (extensions.has(extname(path))) {
      assert(allowed.has(extname(path)), `Unexpected target artifact suffix: ${relative(outputRoot, path)}`)
    }
  }

  const configPath = resolve(ideRoot, platform.projectConfigFileName)
  const config = await readJson(configPath)
  assert.equal(resolve(ideRoot, config.miniprogramRoot), outputRoot, 'IDE must point at the verified output, not source or another target')
  if (profile.host === 'donut') {
    assert.equal(profile.compilerPlatform, 'weapp', 'Donut uses WeChat compilation, not app/harmony')
    assert.equal(config.projectArchitecture, 'multiPlatform', 'Donut IDE project must use multiPlatform architecture')
    const hostConfig = await readJson(resolve(ideRoot, 'project.miniapp.json'))
    const sourceConfig = await readJson(resolve(appRoot, 'config/donut.json'))
    const hostKeys = Object.keys(hostConfig).filter(key => key.startsWith('mini-'))
    assert.deepEqual(hostKeys, [`mini-${profile.os}`], 'Donut project must package only its selected host')
    assert.deepEqual(hostConfig[`mini-${profile.os}`], sourceConfig[`mini-${profile.os}`], 'Donut host SDK metadata diverged from its source')
    assert.equal(hostConfig.miniVersion, sourceConfig.miniVersion)
    assert.equal(hostConfig.version, sourceConfig.version)
    assert.equal(hostConfig.versionCode, sourceConfig.versionCode)
    assert.deepEqual(await readJson(resolve(outputRoot, 'app.miniapp.json')), {}, 'Host packaging settings must not leak into runtime metadata')
  }
  console.log(`Verified ${profile.id}: ${templates.size} reachable page/components, .${markupExtension}/.${styleExtension}, native event bindings and installed style closure.`)
  console.log(`IDE project: ${ideRoot}. Artifact verification is not IDE, simulator, signing, or device verification.`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [target, ...extra] = process.argv.slice(2)
  if (extra.length) { throw new Error('Verification accepts exactly one Registry profile') }
  await verifyProject(getProject(target))
}
