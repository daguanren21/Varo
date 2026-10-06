import { readFile } from 'node:fs/promises'
import { posix } from 'node:path'
import ts from 'typescript'
import { parse } from 'vue/compiler-sfc'
import { resolveRegistryItems } from '../packages/cli/src/index.ts'
import { importSpecifiers, projectFiles, registryItems, registryRoot } from './registry-artifacts.mjs'

const check = process.argv.includes('--check')
if (process.argv.slice(2).some(arg => arg !== '--check')) { throw new Error('Usage: node scripts/sync-component-styles.mjs [--check]') }
const owners = new Map()
for (const item of await registryItems()) {
  if (item.type !== 'component' && item.type !== 'block') { continue }
  for (const target of item.targets) {
    const plan = await resolveRegistryItems([item.id], { target, registryRoot })
    // Native apply-shared components consume the installed closure from app WXSS.
    // Page tokens and attribute selectors are not valid component-local WXSS.
    const styles = target === 'weapp' ? [] : plan.files.filter(file => file.to.endsWith('.css')).map(file => file.to)
    for (const file of item.files.filter(file => file.target === target && /\.(?:vue|ts)$/.test(file.from))) {
      if (target === 'weapp' && !file.from.endsWith('.vue')) { continue }
      const source = await readFile(new URL(`../${file.from}`, import.meta.url), 'utf8')
      if (file.from.endsWith('.ts')) {
        const imports = importSpecifiers(source, file.from)
        const ast = ts.createSourceFile(file.from, source, ts.ScriptTarget.Latest, true)
        const exportsComponent = ast.statements.some(statement => ts.isExportDeclaration(statement)
          && statement.exportClause && ts.isNamedExports(statement.exportClause)
          && statement.exportClause.elements.some(element => element.name.text.startsWith('V')))
        if (!imports.includes('vue') && !exportsComponent) { continue }
      }
      let owner = owners.get(file.from)
      if (!owner) { owner = { source, to: file.to, native: target === 'weapp', styles: new Set() }; owners.set(file.from, owner) }
      if (owner.to !== file.to) { throw new Error(`One authored source has incompatible destinations: ${file.from}`) }
      for (const style of styles) {
        let path = posix.relative(posix.dirname(file.to), style)
        if (!path.startsWith('.')) { path = `./${path}` }
        owner.styles.add(path)
      }
    }
  }
}

const outputs = new Map()
const marker = '/* Registry styles: generated from the dependency closure. */'
for (const [filename, owner] of owners) {
  let source = owner.source
  const styles = [...owner.styles]
  if (filename.endsWith('.vue')) {
    const parsed = parse(source, { filename })
    if (parsed.errors.length) { throw new Error(`${filename}: ${parsed.errors.join('; ')}`) }
    const generated = parsed.descriptor.styles.filter(style => style.content.includes(marker)
      || (owner.native && style.src && posix.normalize(posix.join(posix.dirname(owner.to), style.src)).startsWith('src/styles/')))
    for (const style of generated.reverse()) {
      const start = source.lastIndexOf('<style', style.loc.start.offset)
      const end = source.indexOf('</style>', style.loc.end.offset) + '</style>'.length
      source = source.slice(0, start) + source.slice(end)
    }
    if (styles.length) {
      source = `${source.trimEnd()}\n\n<style>\n${marker}\n${styles.map(style => `@import '${style}';`).join('\n')}\n</style>\n`
    }
  }
  else {
    const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true)
    const removals = ast.statements.filter(statement => ts.isImportDeclaration(statement)
      && !statement.importClause && ts.isStringLiteral(statement.moduleSpecifier)
      && statement.moduleSpecifier.text.endsWith('.css')
      && (owner.styles.has(statement.moduleSpecifier.text)
        || posix.normalize(posix.join(posix.dirname(owner.to), statement.moduleSpecifier.text)).startsWith('src/styles/')))
    // Keep the owned side-effect imports after authored imports, matching import sorting.
    const lastImport = ast.statements.findLast(statement => ts.isImportDeclaration(statement) && !removals.includes(statement))
    let insertion = lastImport?.end ?? 0
    for (const statement of removals.reverse()) {
      const start = statement.getStart(ast)
      let end = statement.end
      if (source[end] === '\r') { end += 1 }
      if (source[end] === '\n') { end += 1 }
      if (end <= insertion) { insertion -= end - start }
      source = source.slice(0, start) + source.slice(end)
    }
    if (styles.length) {
      const prefix = source.slice(0, insertion)
      const suffix = source.slice(insertion)
      source = `${prefix}${prefix ? '\n' : ''}${styles.map(style => `import '${style}'\n`).join('')}${prefix ? suffix.replace(/^\r?\n/, '') : suffix}`
    }
  }
  outputs.set(filename, source)
}
// Only the marked style imports are generated; these authored files must never be deletion-owned.
const changed = await projectFiles(outputs, check, { owner: 'component-styles' })
console.log(`${check ? 'Checked' : 'Synchronized'} styles for ${outputs.size} authored renderer files (${changed} changed).`)
