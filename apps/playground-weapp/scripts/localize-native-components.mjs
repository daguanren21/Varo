import { Buffer } from 'node:buffer'
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { dirname, posix, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { postcss } from 'weapp-tailwindcss/core'
import { importSpecifiers, rewriteModuleSpecifiers } from '../../../scripts/registry-artifacts.mjs'

const componentExtensions = ['.js', '.json', '.wxml', '.wxss']
const cssUrlPattern = /url\(\s*(?:"([^"]*)"\s*|'([^']*)'\s*|([^'")\s][^)]*)?)\)/g

// The compiler emits native components at source-relative paths. Package their
// compiled artifacts with their consumers without changing authored Registry source.
export async function localizeNativeComponents(outputRoot) {
  const files = new Map()
  const directories = new Set()
  async function collect(directory = '') {
    for (const entry of await readdir(resolve(outputRoot, directory), { withFileTypes: true })) {
      const name = posix.join(directory, entry.name)
      if (entry.isDirectory()) { directories.add(name); await collect(name) }
      else if (entry.isFile()) { files.set(name, await readFile(resolve(outputRoot, name))) }
      else { throw new Error(`Unsupported native artifact: ${name}`) }
    }
  }
  await collect()
  const jsonFiles = new Map([...files].filter(([name]) => name.endsWith('.json')).map(([name, source]) => [name, JSON.parse(source.toString('utf8'))]))
  const app = jsonFiles.get('app.json')
  if (!app) { throw new Error('Missing compiled app.json') }
  const packages = app.subPackages ?? app.subpackages ?? []
  const roots = packages.map(pkg => pkg.root.replace(/\/$/, '')).sort((a, b) => b.length - a.length)
  for (const root of roots) {
    if (!root || root.startsWith('/') || root.split('/').some(part => !part || part === '.' || part === '..') || /[\\:\0]/.test(root)) {
      throw new Error(`Unsafe native package root: ${root}`)
    }
  }
  const packageOwner = name => roots.find(root => name.startsWith(`${root}/`)) ?? ''
  const components = new Set([...jsonFiles].filter(([, json]) => json.component === true).map(([name]) => name.slice(0, -5)))
  const resolveReference = (owner, value) => posix.normalize(value.startsWith('/') ? value.slice(1) : posix.join(posix.dirname(owner), value))
  const isExternal = value => /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)
  const artifactReferences = new Map()
  for (const [name, source] of files) {
    const references = []
    const add = (value, extension = '') => {
      if (typeof value !== 'string' || isExternal(value) || value.includes('{{')) { return }
      const target = resolveReference(name, value.replace(/[?#].*$/, ''))
      references.push(extension ? `${target}${extension}` : files.has(target) ? target : `${target}.js`)
    }
    if (name.endsWith('.json')) {
      const json = jsonFiles.get(name)
      for (const value of Object.values(json.usingComponents ?? {})) { add(value, '.json') }
      for (const value of Object.values(json.componentGenerics ?? {})) { add(value?.default, '.json') }
    }
    else if (/\.(?:js|wxs)$/.test(name)) {
      for (const value of importSpecifiers(source.toString('utf8'), name)) {
        if (value.startsWith('.') || value.startsWith('/')) { add(value) }
      }
    }
    else if (name.endsWith('.wxml')) {
      for (const match of source.toString('utf8').matchAll(/\bsrc\s*=\s*(["'])([^"']*)\1/g)) { add(match[2]) }
    }
    else if (name.endsWith('.wxss')) {
      const css = postcss.parse(source.toString('utf8'), { from: name })
      css.walkAtRules('import', (rule) => { const match = rule.params.match(/^(["'])(.+?)\1/); if (match) { add(match[2]) } })
      css.walkDecls((declaration) => {
        for (const match of declaration.value.matchAll(cssUrlPattern)) { add(match[1] ?? match[2] ?? match[3]?.trim() ?? '') }
      })
    }
    artifactReferences.set(name, references)
  }
  const owners = new Map()
  const visited = new Set()
  function visit(name, owner) {
    const key = `${owner}:${name}`
    if (visited.has(key)) { return }
    visited.add(key)
    if (!files.has(name)) { throw new Error(`Missing native artifact: ${name}`) }
    const base = name.replace(/\.(?:js|json|wxml|wxss)$/, '')
    if (components.has(base)) {
      if (!owners.has(base)) { owners.set(base, new Set()) }
      owners.get(base).add(owner)
    }
    if (components.has(base) || name.endsWith('.json')) {
      for (const extension of componentExtensions) {
        const companion = `${base}${extension}`
        if (files.has(companion)) { visit(companion, owner) }
      }
    }
    for (const target of artifactReferences.get(name) ?? []) { visit(target, owner) }
  }
  visit('app.json', '')
  for (const page of app.pages ?? []) { visit(`${page}.json`, '') }
  for (const pkg of packages) {
    for (const page of pkg.pages ?? []) { visit(`${pkg.root}/${page}.json`, pkg.root.replace(/\/$/, '')) }
  }
  // Shared scripts, templates, and styles retain their complete dependency closure.
  for (const [name, references] of artifactReferences) {
    if (components.has(name.replace(/\.(?:js|json|wxml|wxss)$/, ''))) { continue }
    for (const target of references) { visit(target, packageOwner(name)) }
  }
  const relocated = new Map([...owners].filter(([base, consumers]) => !packageOwner(base) && !consumers.has('')))
  const removed = new Set()
  const copies = new Map()
  for (const [base, consumers] of relocated) {
    for (const extension of componentExtensions) {
      const original = `${base}${extension}`
      if (!files.has(original)) {
        if (extension === '.wxss') { continue }
        throw new Error(`Missing native component artifact: ${original}`)
      }
      removed.add(original)
      for (const owner of consumers) {
        const destination = `${owner}/${original}`
        if (files.has(destination) || directories.has(destination) || copies.has(destination)) {
          throw new Error(`Native component destination conflict: ${destination}`)
        }
        for (let ancestor = posix.dirname(destination); ancestor !== '.'; ancestor = posix.dirname(ancestor)) {
          if (files.has(ancestor) || copies.has(ancestor)) { throw new Error(`Native component destination conflict: ${ancestor}`) }
        }
        copies.set(destination, original)
      }
    }
  }
  function rewriteReference(value, original, destination, owner, module = false) {
    if (isExternal(value) || value.includes('{{') || (module && !value.startsWith('.') && !value.startsWith('/'))) { return value }
    const suffixIndex = value.search(/[?#]/)
    const suffix = suffixIndex < 0 ? '' : value.slice(suffixIndex)
    const path = suffixIndex < 0 ? value : value.slice(0, suffixIndex)
    const target = resolveReference(original, path)
    const base = target.replace(/\.(?:js|json|wxml|wxss)$/, '')
    let mapped = target
    if (relocated.has(base)) {
      if (!relocated.get(base).has(owner)) { throw new Error(`Native component has no package owner: ${original} -> ${target}`) }
      mapped = `${owner}/${target}`
    }
    if (original === destination && target === mapped) { return value }
    if (path.startsWith('/')) { return `/${mapped}${suffix}` }
    const relative = posix.relative(posix.dirname(destination), mapped)
    return `${relative.startsWith('.') ? relative : `./${relative}`}${suffix}`
  }
  function rewrite(original, destination) {
    const content = files.get(original)
    if (!/\.(?:js|json|wxml|wxss|wxs)$/.test(original)) { return content }
    const source = content.toString('utf8')
    const owner = packageOwner(destination)
    const reference = (value, module = false) => rewriteReference(value, original, destination, owner, module)
    if (/\.(?:js|wxs)$/.test(original)) {
      return Buffer.from(rewriteModuleSpecifiers(source, original, value => reference(value, true)))
    }
    if (original.endsWith('.json')) {
      const json = structuredClone(jsonFiles.get(original))
      for (const [name, value] of Object.entries(json.usingComponents ?? {})) {
        if (typeof value === 'string') { json.usingComponents[name] = reference(value) }
      }
      for (const value of Object.values(json.componentGenerics ?? {})) {
        if (value && typeof value.default === 'string') { value.default = reference(value.default) }
      }
      return Buffer.from(JSON.stringify(json))
    }
    if (original.endsWith('.wxml')) {
      return Buffer.from(source.replace(/\bsrc\s*=\s*(["'])([^"']*)\1/g, (match, quote, value) => match.replace(`${quote}${value}${quote}`, `${quote}${reference(value)}${quote}`)))
    }
    const css = postcss.parse(source, { from: original })
    css.walkAtRules('import', (rule) => {
      rule.params = rule.params.replace(/^(["'])(.+?)\1/, (_match, quote, value) => `${quote}${reference(value)}${quote}`)
    })
    css.walkDecls((declaration) => {
      declaration.value = declaration.value.replace(cssUrlPattern, (_match, doubleQuoted, singleQuoted, unquoted) => {
        const quote = doubleQuoted !== undefined ? '"' : singleQuoted !== undefined ? '\'' : ''
        const value = doubleQuoted ?? singleQuoted ?? unquoted?.trim() ?? ''
        return `url(${quote}${reference(value)}${quote})`
      })
    })
    return Buffer.from(css.toString())
  }
  // Resolve every path and reject conflicts before replacing any compiler output.
  const outputs = new Map([...files].filter(([name]) => !removed.has(name)).map(([name]) => [name, rewrite(name, name)]))
  for (const [destination, original] of copies) { outputs.set(destination, rewrite(original, destination)) }
  for (const [name, content] of outputs) {
    if (files.get(name)?.equals(content)) { continue }
    const path = resolve(outputRoot, name)
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, content)
  }
  for (const name of removed) { await unlink(resolve(outputRoot, name)) }
  return { components: relocated.size, copies: copies.size, removedBytes: [...removed].reduce((total, name) => total + files.get(name).length, 0) }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await localizeNativeComponents(fileURLToPath(new URL('../devtools/build/mp-weixin/', import.meta.url)))
  console.log(`Localized ${result.components} subpackage-only components; removed ${result.removedBytes} bytes from main`)
}
