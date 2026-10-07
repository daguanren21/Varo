import { posix } from 'node:path'
import ts from 'typescript'
import { parse as parseSfc } from 'vue/compiler-sfc'

const assetPattern = /\.(?:png|jpe?g|webp|gif|svg|ico|woff2?|ttf|mp4|mp3)$/i
const scriptExtensions = new Set(['.ts', '.js', '.mjs'])
const vueImports = new Set([
  'computed',
  'getCurrentInstance',
  'inject',
  'nextTick',
  'onMounted',
  'onUnmounted',
  'shallowRef',
  'toRef',
  'useSlots',
  'watch',
])
const vueTypes = new Set(['ShallowRef'])
const pageHooks = new Map([
  ['onLoad', 'useLoad'],
  ['onShow', 'useDidShow'],
  ['onHide', 'useDidHide'],
  ['onUnload', 'useUnload'],
  ['onLaunch', 'useLaunch'],
  ['onReady', 'useReady'],
])
const nativeApis = new Set(['getWindowInfo', 'navigateBack', 'navigateTo', 'showToast', 'switchTab'])
const componentOptions = new Set(['styleIsolation', 'multipleSlots', 'addGlobalClass', 'virtualHost'])
const appPlatformOptions = { style: 'v2', componentFramework: 'glass-easel', lazyCodeLoading: 'requiredComponents' }
function inputAriaHelper(framework) {
  return `
  function copyFieldAttribute(field: Element, owner: Element, name: string) {
    const value = owner.getAttribute(name)
    if (field.getAttribute(name) === value) return
    if (value === null) field.removeAttribute(name)
    else field.setAttribute(name, value)
  }
  function syncInputAria(root: HTMLElement) {
    const fields = root.querySelectorAll('input, textarea')
    for (let index = 0; index < fields.length; index++) {
      const field = fields[index]!
      const owner = field.closest('${framework === 'taro' ? 'taro-input-core, taro-textarea-core' : 'uni-input, uni-textarea'}')
      if (!owner) continue
      // Host wrappers do not forward all accessibility attributes to their HTML control.
      copyFieldAttribute(field, owner, 'aria-label')
      copyFieldAttribute(field, owner, 'aria-labelledby')
      copyFieldAttribute(field, owner, 'aria-describedby')
      copyFieldAttribute(field, owner, 'aria-invalid')
      copyFieldAttribute(field, owner, 'aria-required')
      copyFieldAttribute(field, owner, 'aria-readonly')
    }
  }
`
}

function taroLoadAdapter(binding) {
  const hook = `retailTaroLoad_${binding}`
  return `const ${binding}: typeof ${hook} = process.env.TARO_ENV === 'h5'
  ? listener => ${hook}<Parameters<typeof listener>[0]>(options => {
    // Taro's SPA router preserves percent encoding; do not mutate shared hook options.
    let decoded = options
    for (const key in options) {
      if (!Object.hasOwn(options, key)) continue
      const value = options[key]
      if (typeof value !== 'string' || !value.includes('%')) continue
      if (decoded === options) decoded = { ...options }
      decoded[key] = new URLSearchParams('value=' + value).get('value')! as typeof value
    }
    return listener(decoded)
  })
  : ${hook}
`
}

function h5DomHelper(includeInput, framework) {
  const observeInputHydration = includeInput && framework === 'taro'
  return `
${framework === 'uni-app' ? '// #ifdef H5' : ''}
import * as retailDomVue from 'vue'
${framework === 'taro' ? 'if (process.env.TARO_ENV === \'h5\')' : ''} {
  const instance = retailDomVue.getCurrentInstance()!
  let root: HTMLElement | null = null
${observeInputHydration ? '  let inputObserver: MutationObserver | null = null' : ''}
${includeInput ? inputAriaHelper(framework) : ''}
  // Bind keyboard activation at the browser boundary, not to normalized host events.
  function activate(event: KeyboardEvent) {
    const target = event.target
    if (event.defaultPrevented || !(target instanceof HTMLElement) || !target.hasAttribute('data-varo-keyboard')
      || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    if (!event.repeat) target.click()
  }
  function syncRoot() {
    const element = instance.proxy?.$el
    const next = element instanceof HTMLElement ? element : null
${includeInput ? '    if (next) syncInputAria(next)' : ''}
    if (next === root) return
    root?.removeEventListener('keydown', activate)
${observeInputHydration ? '    inputObserver?.disconnect()' : ''}
    root = next
    root?.addEventListener('keydown', activate)
${observeInputHydration
  ? `    if (root) {
      // Taro renders inner HTML fields after the surrounding Vue component mounts.
      inputObserver ??= new MutationObserver(() => { if (root) syncInputAria(root) })
      inputObserver.observe(root, { childList: true, subtree: true })
    }`
  : ''}
  }
  retailDomVue.onMounted(syncRoot)
  retailDomVue.onUpdated(syncRoot)
  retailDomVue.onBeforeUnmount(() => {
    root?.removeEventListener('keydown', activate)
${observeInputHydration ? '    inputObserver?.disconnect()' : ''}
    root = null
  })
}
${framework === 'uni-app' ? '// #endif' : ''}
`
}

function unsupported(file, message) {
  throw new Error(`Cannot convert ${file} to a Vue retail project: ${message}`)
}

function object(value, file, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) { unsupported(file, `${label} must be an object`) }
  return value
}

function json(content, file) {
  const result = ts.parseConfigFileTextToJson(file, content)
  if (result.error) { unsupported(file, ts.flattenDiagnosticMessageText(result.error.messageText, '\n')) }
  return object(result.config, file, 'JSON configuration')
}

function editRanges(source, edits, file) {
  let boundary = source.length
  let result = source
  for (const edit of edits.sort((left, right) => right.start - left.start || right.end - left.end)) {
    if (edit.start < 0 || edit.end > boundary || edit.start > edit.end) { unsupported(file, 'overlapping source transformations') }
    result = result.slice(0, edit.start) + edit.text + result.slice(edit.end)
    boundary = edit.start
  }
  return result
}

function blockRange(source, block) {
  return {
    start: source.lastIndexOf(`<${block.type}`, block.loc.start.offset),
    end: source.indexOf('>', block.loc.end.offset) + 1,
  }
}

function parseComponent(source, file) {
  const result = parseSfc(source, { filename: file, ignoreEmpty: false })
  if (result.errors.length) { unsupported(file, String(result.errors[0])) }
  const { descriptor } = result
  if (descriptor.script || descriptor.scriptSetup?.src || descriptor.template?.src
    || descriptor.styles.some(style => style.src || style.lang)) {
    unsupported(file, 'only inline script setup, template and CSS blocks are supported')
  }
  if (descriptor.scriptSetup?.lang && descriptor.scriptSetup.lang !== 'ts') { unsupported(file, 'script setup must use TypeScript') }
  if (descriptor.template?.lang) { unsupported(file, 'template preprocessors are not supported') }
  if (descriptor.customBlocks.some(block => block.type !== 'json') || descriptor.customBlocks.length > 1) {
    unsupported(file, 'expected at most one native JSON block')
  }
  const config = descriptor.customBlocks[0]
  return { descriptor, config: config ? json(config.content, file) : {} }
}

function propertyName(node, file) {
  if (node.name && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))) { return node.name.text }
  unsupported(file, 'computed or spread option names need an explicit conversion')
}

function properties(node, file) {
  if (!node || !ts.isObjectLiteralExpression(node)) { unsupported(file, 'options must be object literals') }
  const result = new Map()
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) { unsupported(file, 'options must be static property assignments') }
    const name = propertyName(property, file)
    if (result.has(name)) { unsupported(file, `duplicate option ${name}`) }
    result.set(name, property)
  }
  return result
}

function isCall(node, name) {
  return Boolean(node) && ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === name
}

function inspectProps(parsed, file) {
  const props = new Set()
  const defaults = new Map()
  function visit(node) {
    if (isCall(node, 'defineProps')) {
      const type = node.typeArguments?.[0]
      if (type && ts.isTypeLiteralNode(type)) {
        for (const member of type.members) { props.add(propertyName(member, file)) }
      }
    }
    if (isCall(node, 'withDefaults') && isCall(node.arguments[0], 'defineProps')) {
      for (const [name, property] of properties(node.arguments[1], file)) { defaults.set(name, property.initializer) }
    }
    ts.forEachChild(node, visit)
  }
  visit(parsed)
  return { props, defaults }
}

function sameDefault(left, right) {
  if (left.kind !== right.kind) { return false }
  if (ts.isStringLiteral(left) || ts.isNumericLiteral(left) || ts.isIdentifier(left)) { return left.text === right.text }
  if (ts.isPropertyAccessExpression(left)) { return left.name.text === right.name.text && sameDefault(left.expression, right.expression) }
  if (ts.isPrefixUnaryExpression(left)) { return left.operator === right.operator && sameDefault(left.operand, right.operand) }
  return [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(left.kind)
}

function convertOptions(parsed, metadata, file, replace, record, framework) {
  const statements = parsed.statements.filter(statement => ts.isExpressionStatement(statement) && isCall(statement.expression, 'defineOptions'))
  if (statements.length > 1) { unsupported(file, 'duplicate defineOptions calls') }
  const statement = statements[0]
  const entries = statement ? properties(statement.expression.arguments[0], file) : new Map()
  const result = []
  const options = { ...metadata }
  for (const [name, property] of entries) {
    if (name === 'properties') {
      const vue = inspectProps(parsed, file)
      for (const [propName, nativeProperty] of properties(property.initializer, file)) {
        const fields = properties(nativeProperty.initializer, file)
        if (!vue.props.has(propName) || (fields.has('value') && !vue.defaults.has(propName))) {
          unsupported(file, `native property ${propName} has no equivalent defineProps/withDefaults contract`)
        }
        const nativeDefault = fields.get('value')?.initializer
        const vueDefault = vue.defaults.get(propName)
        const explicitlyUncontrolled = vueDefault && ts.isIdentifier(vueDefault) && vueDefault.text === 'undefined'
        if (nativeDefault && !explicitlyUncontrolled && !sameDefault(nativeDefault, vueDefault)) {
          unsupported(file, `native property ${propName} conflicts with its Vue default`)
        }
        for (const [field, value] of fields) {
          if (field !== 'value' && (field !== 'type' || value.initializer.kind !== ts.SyntaxKind.NullKeyword)) {
            unsupported(file, `native property ${propName}.${field} has no Vue conversion`)
          }
        }
      }
      // Vue's typed props retain union types; withDefaults owns initial values,
      // including an explicit undefined for a genuinely uncontrolled input.
      record('Use typed Vue props and withDefaults instead of native initial-property guards.')
    }
    else if (name === 'behaviors') {
      const value = property.initializer
      if (!ts.isArrayLiteralExpression(value) || value.elements.some(element => !ts.isStringLiteral(element) || element.text !== 'wx://form-field-button')) {
        unsupported(file, 'only the native form-field-button behavior has an approved Vue conversion')
      }
      if (framework === 'uni-app') { result.push('behaviors: [\'uni://form-field-button\']') }
      record(framework === 'taro'
        ? 'Use Taro form/button elements in the same rendered tree; no native wrapper behavior is needed.'
        : 'Preserve native form submission through the uni form-field-button behavior.')
    }
    else if (name === 'options') {
      for (const [key, value] of properties(property.initializer, file)) {
        if (!componentOptions.has(key)) { unsupported(file, `unsupported native option ${key}`) }
        if (Object.hasOwn(options, key)) { unsupported(file, `duplicate native option ${key}`) }
        options[key] = { expression: value.initializer.getText(parsed) }
      }
    }
    else if (name === 'inheritAttrs' || name === 'name') {
      result.push(property.getText(parsed))
    }
    else { unsupported(file, `unsupported defineOptions field ${name}`) }
  }
  if (Object.keys(options).length) {
    if (framework === 'taro') {
      for (const [name, value] of Object.entries(options)) {
        const expression = typeof value === 'object' ? value.expression : JSON.stringify(value)
        const supported = name === 'styleIsolation' ? /^['"](?:apply-shared|shared)['"]$/.test(expression) : expression === 'true'
        if (!supported) { unsupported(file, `Taro Vue rendering cannot preserve component option ${name}: ${expression}`) }
      }
      record('Use Vue slots and the shared Taro render tree instead of native wrapper/isolation metadata.')
    }
    else {
      result.push(`options: { ${Object.entries(options).map(([name, value]) => `${name}: ${typeof value === 'object' ? value.expression : JSON.stringify(value)}`).join(', ')} }`)
      record('Preserve native component isolation and slot options in uni component options.')
    }
  }
  const output = result.length ? `defineOptions({\n  ${result.join(',\n  ')},\n})` : ''
  if (statement) {
    const comments = ts.getLeadingCommentRanges(parsed.text, statement.getFullStart()) ?? []
    const obsolete = comments.some(comment => parsed.text.slice(comment.pos, comment.end).includes('Wevu'))
    replace(obsolete ? comments[0].pos : statement.getStart(parsed), statement.end, output)
  }
  else if (output) { replace(0, 0, `\n${output}\n`) }
  return statement
}

function convertScript(source, file, assetUrl, metadata, record, framework) {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  if (parsed.parseDiagnostics.length) { unsupported(file, ts.flattenDiagnosticMessageText(parsed.parseDiagnostics[0].messageText, '\n')) }
  const edits = []
  const replace = (start, end, text) => edits.push({ start, end, text })
  const optionStatement = metadata ? convertOptions(parsed, metadata, file, replace, record, framework) : undefined
  let needsTaro = false
  let needsTaroLoadAdapter = false

  function visit(node) {
    if (node === optionStatement) { return }
    if (ts.isImportDeclaration(node)) {
      const specifier = node.moduleSpecifier.text
      if (specifier === 'wevu') {
        const clause = node.importClause
        if (!clause || clause.name || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) {
          unsupported(file, 'Wevu imports must explicitly name their APIs')
        }
        const groups = new Map()
        let loadAdapters = ''
        for (const binding of clause.namedBindings.elements) {
          const name = (binding.propertyName ?? binding.name).text
          const typeOnly = clause.isTypeOnly || binding.isTypeOnly
          const lifecycle = pageHooks.has(name) && !typeOnly
          const target = lifecycle ? framework === 'taro' ? '@tarojs/taro' : '@dcloudio/uni-app' : 'vue'
          if (target === 'vue' && !(typeOnly ? vueTypes : vueImports).has(name)) { unsupported(file, `unsupported Wevu API ${name}`) }
          const imported = lifecycle && framework === 'taro' ? pageHooks.get(name) : name
          let local = binding.name.text
          if (lifecycle && framework === 'taro' && name === 'onLoad') {
            needsTaroLoadAdapter = true
            loadAdapters += taroLoadAdapter(local)
            local = `retailTaroLoad_${local}`
          }
          const text = `${binding.isTypeOnly ? 'type ' : ''}${imported}${imported === local ? '' : ` as ${local}`}`
          if (!groups.has(target)) { groups.set(target, []) }
          groups.get(target).push(text)
        }
        replace(node.getStart(parsed), node.end, [...groups].map(([target, bindings]) => `import ${clause.isTypeOnly ? 'type ' : ''}{ ${bindings.join(', ')} } from '${target}'`).join('\n') + (loadAdapters ? `\n${loadAdapters}` : ''))
        record(`Map composition APIs to Vue and page/app lifecycle hooks to ${framework}.`)
        return
      }
      const asset = assetUrl(specifier)
      if (asset) {
        const clause = node.importClause
        if (!clause?.name || clause.namedBindings || clause.isTypeOnly) { unsupported(file, 'static assets must use a default URL import') }
        replace(node.getStart(parsed), node.end, `const ${clause.name.text} = ${JSON.stringify(asset)}`)
        record('Replace bundler-only asset imports with collected static URLs.')
        return
      }
      if (specifier === '@weapp-tailwindcss/merge') {
        const clause = node.importClause
        const bindings = clause?.namedBindings
        if (clause?.name || !bindings || !ts.isNamedImports(bindings) || bindings.elements.length !== 1
          || bindings.elements[0].name.text !== 'twMerge' || bindings.elements[0].propertyName) {
          unsupported(file, 'class merging must use the approved twMerge binding')
        }
        const options = framework === 'taro'
          ? '  escape: process.env.TARO_ENV === \'weapp\',\n  unescape: process.env.TARO_ENV === \'weapp\','
          : '  // #ifdef H5\n  escape: false,\n  unescape: false,\n  // #endif'
        replace(node.getStart(parsed), node.end, `import { create } from '@weapp-tailwindcss/merge'\n\nconst { twMerge } = create({\n${options}\n})`)
        record('Keep literal utility classes on H5 and mini-program class escaping on WeChat.')
        return
      }
      if (specifier.startsWith('wevu/')) { unsupported(file, 'Wevu internals cannot be exported') }
    }
    if (ts.isVariableStatement(node) && node.declarationList.declarations.length === 1) {
      const declaration = node.declarationList.declarations[0]
      const call = declaration.initializer
      if (call && ts.isCallExpression(call) && ts.isPropertyAccessExpression(call.expression)
        && ts.isIdentifier(call.expression.expression) && call.expression.expression.text === 'wx'
        && call.expression.name.text === 'getMenuButtonBoundingClientRect') {
        if (!ts.isIdentifier(declaration.name) || call.arguments.length) { unsupported(file, 'capsule metrics must be a single local binding without arguments') }
        const text = framework === 'taro'
          ? `const ${declaration.name.text} = process.env.TARO_ENV === 'weapp' ? Taro.getMenuButtonBoundingClientRect() : undefined`
          : `let ${declaration.name.text}: ReturnType<typeof uni.getMenuButtonBoundingClientRect> | undefined\n    // #ifdef MP-WEIXIN\n    ${declaration.name.text} = uni.getMenuButtonBoundingClientRect()\n    // #endif`
        replace(node.getStart(parsed), node.end, text)
        needsTaro ||= framework === 'taro'
        record('Read real capsule metrics only on WeChat; H5 uses window metrics without a capsule.')
        return
      }
    }
    if (ts.isIdentifier(node) && node.text === 'wx') {
      const parent = node.parent
      if (ts.isPropertyAccessExpression(parent) && parent.expression === node) {
        if (!nativeApis.has(parent.name.text)) { unsupported(file, `unsupported native API wx.${parent.name.text}`) }
        replace(node.getStart(parsed), node.end, framework === 'taro' ? 'Taro' : 'uni')
        needsTaro ||= framework === 'taro'
        record(`Use ${framework} platform APIs for navigation, feedback and window metrics.`)
      }
      else if (ts.isTypeOfExpression(parent)) {
        replace(node.getStart(parsed), node.end, framework === 'taro' ? 'Taro' : 'uni')
        needsTaro ||= framework === 'taro'
      }
      else { unsupported(file, 'native global wx is shadowed or used outside an approved API call') }
      return
    }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const asset = assetUrl(node.text)
      if (asset) {
        replace(node.getStart(parsed), node.end, JSON.stringify(asset))
        record('Rewrite static asset references to collected static URLs.')
      }
      if (node.text === 'wevu' && !ts.isImportDeclaration(node.parent)) { unsupported(file, 'Wevu module references must use named imports') }
    }
    ts.forEachChild(node, visit)
  }
  visit(parsed)
  if (needsTaroLoadAdapter) {
    if (/\bretailTaroLoad_/.test(source)) { unsupported(file, 'Taro route hook import name is already in use') }
    record('Decode Taro SPA query strings once without mutating shared options; retain direct native load hooks.')
  }
  if (needsTaro) {
    if (/\bTaro\b/.test(source)) { unsupported(file, 'Taro platform import name is already in use') }
    replace(0, 0, 'import Taro from \'@tarojs/taro\'\n')
  }
  return editRanges(source, edits, file)
}

function templateAttribute(node, name) {
  return node.props.find(prop => prop.type === 6
    ? prop.name === name
    : prop.type === 7 && prop.name === 'bind' && prop.arg?.content === name)
}

function boundAttribute(name, expression) {
  return ` :${name}="${expression.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`
}

function convertTemplate(template, file, assetUrl, edits, record, framework) {
  let keyboard = false
  let input = false
  function visit(node) {
    if (node.type === 1) {
      if (node.tag === 'input' || node.tag === 'textarea') { input = true }
      const interactive = templateAttribute(node, 'data-interactive')
      const click = node.props.find(prop => prop.type === 7 && prop.name === 'on' && ['click', 'tap'].includes(prop.arg?.content))
      if (node.tag === 'button' || (node.tag === 'view' && interactive && click)) {
        const disabled = templateAttribute(node, 'disabled')
        const enabled = node.tag === 'button'
          ? disabled?.type === 7 ? `!(${disabled.exp.content})` : String(!disabled)
          : `String(${interactive.type === 7 ? interactive.exp.content : JSON.stringify(interactive.value?.content)}) === 'true'`
        const role = templateAttribute(node, 'role')
        let attributes = ''
        if (!role) {
          attributes += node.tag === 'button' ? ' role="button"' : boundAttribute('role', `(${enabled}) ? 'button' : undefined`)
        }
        else if (node.tag === 'view' && role.type === 7) {
          edits.push({ start: role.loc.start.offset, end: role.loc.end.offset, text: boundAttribute('role', `${role.exp.content} || ((${enabled}) ? 'button' : undefined)`) })
        }
        if (!templateAttribute(node, 'tabindex')) { attributes += boundAttribute('tabindex', `(${enabled}) ? 0 : -1`) }
        if (node.tag === 'button' && disabled && !templateAttribute(node, 'aria-disabled')) {
          attributes += disabled.type === 7 ? boundAttribute('aria-disabled', disabled.exp.content) : ' aria-disabled="true"'
        }
        if (!node.props.some(prop => prop.type === 7 && prop.name === 'on' && prop.arg?.content === 'keydown')) {
          attributes += ' data-varo-keyboard=""'
          keyboard = true
        }
        if (attributes) {
          const start = node.loc.start.offset + node.tag.length + 1
          edits.push({ start, end: start, text: attributes })
          record(`Keep ${framework} H5 buttons and interactive cards focusable, with click activation for Enter/Space.`)
        }
      }
      for (const prop of node.props) {
        if (framework === 'taro' && prop.type === 7 && prop.name === 'on' && prop.arg?.content === 'tap') {
          edits.push({ start: prop.arg.loc.start.offset, end: prop.arg.loc.end.offset, text: 'click' })
          record('Map native tap bindings to Taro click events without changing component payloads.')
        }
        if (prop.type === 6 && prop.value) {
          if (node.tag === 'button' && prop.name === 'type' && prop.value.content === 'button') {
            edits.push({ start: prop.loc.start.offset, end: prop.loc.end.offset, text: '' })
            record('Use host button defaults for non-submit controls; preserve form-type and event bindings.')
          }
          else if (prop.name === 'class' || prop.name === 'class-name') {
            const classes = prop.value.content.split(/\s+/)
            if (classes.includes('fixed') && classes.includes('bottom-0')) {
              const bottom = framework === 'taro' ? 'bottom-[var(--varo-retail-bottom,0px)]' : 'bottom-[var(--window-bottom,0px)]'
              const adjusted = classes.map(value => value === 'bottom-0' ? bottom : value).join(' ')
              edits.push({ start: prop.value.loc.start.offset, end: prop.value.loc.end.offset, text: JSON.stringify(adjusted) })
              record(`Position fixed footers above the ${framework} H5 tab bar, retaining zero offset on native hosts.`)
            }
          }
          else if (prop.name === 'src' || prop.name === 'poster') {
            const asset = assetUrl(prop.value.content)
            if (asset) {
              edits.push({ start: prop.value.loc.start.offset, end: prop.value.loc.end.offset, text: JSON.stringify(asset) })
              record('Rewrite template assets to collected static URLs.')
            }
          }
        }
        else if (prop.type === 7 && prop.exp && prop.name === 'bind') {
          const expression = prop.exp.content
          const parsed = ts.createSourceFile(file, `(${expression})`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
          function literals(child) {
            if (ts.isStringLiteral(child) || ts.isNoSubstitutionTemplateLiteral(child)) {
              const asset = assetUrl(child.text)
              if (asset) {
                // The wrapper parenthesis exists only in the expression parser.
                const start = prop.exp.loc.start.offset + child.getStart(parsed) - 1
                edits.push({ start, end: prop.exp.loc.start.offset + child.end - 1, text: `'${asset}'` })
                record('Rewrite bound template assets to collected static URLs.')
              }
            }
            ts.forEachChild(child, literals)
          }
          literals(parsed)
        }
      }
    }
    for (const child of node.children ?? []) { visit(child) }
  }
  if (template?.ast) { visit(template.ast) }
  return { keyboard, input }
}

function convertCss(source, file, assetUrl, record, framework) {
  const edits = []
  if (framework === 'taro') {
    for (const match of source.matchAll(/(^|\n)([ \t]*)page(?=\s*\{)/g)) {
      const start = match.index + match[1].length + match[2].length
      edits.push({ start, end: start + 4, text: 'page, :root' })
      record('Expose native page tokens on the H5 document root; the native CSS compiler maps :root back to page.')
    }
  }
  const references = /@import\s+(?:url\(\s*)?['"]([^'"]+)['"]|url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g
  for (const match of source.matchAll(references)) {
    const reference = match[1] ?? match[2]
    const asset = assetUrl(reference)
    if (!asset) { continue }
    const start = match.index + match[0].indexOf(reference)
    edits.push({ start, end: start + reference.length, text: asset })
    record('Rewrite stylesheet assets to collected static URLs.')
  }
  return editRanges(source, edits, file)
}

function componentMetadata(config, file) {
  const result = {}
  for (const [key, value] of Object.entries(config)) {
    if (key === '$schema') { continue }
    if (key === 'component' && value === true) { continue }
    if (key === 'usingComponents' && Object.keys(object(value, file, key)).length === 0) { continue }
    if (!componentOptions.has(key) || (key === 'styleIsolation'
      ? !['isolated', 'apply-shared', 'shared'].includes(value)
      : typeof value !== 'boolean')) {
      unsupported(file, `unsupported component configuration ${key}`)
    }
    result[key] = value
  }
  return result
}

function pageStyle(config, file) {
  const result = { ...config }
  delete result.$schema
  if (result.usingComponents) {
    if (Object.keys(object(result.usingComponents, file, 'usingComponents')).length) {
      unsupported(file, 'native usingComponents requires a cross-platform Vue import')
    }
    delete result.usingComponents
  }
  if (result.component || result.componentGenerics) { unsupported(file, 'page configuration contains native component metadata') }
  return result
}

/** Convert the already collected retail closure in memory, before starter templates are added. */
export function convertRetailSources(files, transforms, framework) {
  if (framework !== 'uni-app' && framework !== 'taro') { throw new Error(`Unsupported Vue export framework: ${framework}`) }
  const appFile = 'src/app.vue'
  if (!files.has(appFile) || files.has('src/App.vue') || files.has('src/pages.json') || files.has('src/app.config.ts')) {
    unsupported(appFile, 'expected a native app source and no pre-existing Vue app/pages files')
  }
  const components = new Map()
  const assets = new Map()
  const operations = []
  const converted = new Map()
  for (const [file, content] of files) {
    if (!file.startsWith('src/') || posix.normalize(file) !== file || file.includes('\\')) { unsupported(file, 'expected a collected src-relative source path') }
    if (file.endsWith('.vue')) { components.set(file, parseComponent(content.toString(), file)) }
    if (assetPattern.test(file)) { assets.set(file, file.startsWith('src/static/') ? file : `src/static/${file.slice(4)}`) }
  }
  function assetResolver(owner) {
    return (reference) => {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) { return undefined }
      const suffixIndex = reference.search(/[?#]/)
      const path = suffixIndex < 0 ? reference : reference.slice(0, suffixIndex)
      if (!assetPattern.test(path)) { return undefined }
      const sourcePath = path.startsWith('/') ? `src${path}` : posix.join(posix.dirname(owner), path)
      const destination = assets.get(sourcePath)
      if (!destination) { unsupported(owner, `asset is outside the collected closure: ${reference}`) }
      return `/${destination.slice(4)}${suffixIndex < 0 ? '' : reference.slice(suffixIndex)}`
    }
  }
  const app = components.get(appFile).config
  const pages = new Set()
  function page(path, root = '') {
    if (typeof path !== 'string' || posix.normalize(path) !== path || path.startsWith('/') || path.startsWith('../')) { unsupported(appFile, 'invalid route path') }
    const route = root ? `${root}/${path}` : path
    if (pages.has(route)) { unsupported(appFile, `duplicate route ${route}`) }
    pages.add(route)
    const file = `src/${route}.vue`
    if (!components.has(file)) { unsupported(appFile, `missing registered page ${file}`) }
    const style = pageStyle(components.get(file).config, file)
    if (framework === 'taro') { converted.set(`src/${route}.config.ts`, `export default definePageConfig(${JSON.stringify(style, null, 2)})\n`) }
    return { path, style }
  }
  if (!Array.isArray(app.pages) || !app.pages.length) { unsupported(appFile, 'missing registered retail pages') }
  const pagesJson = { pages: app.pages.map(path => page(path)) }
  const groups = app.subPackages ?? app.subpackages ?? []
  if (!Array.isArray(groups)) { unsupported(appFile, 'subPackages must be an array') }
  if (groups.length) {
    pagesJson.subPackages = groups.map((group) => {
      object(group, appFile, 'subpackage')
      if (typeof group.root !== 'string' || !group.root || group.root.startsWith('/') || group.root.startsWith('../')
        || posix.normalize(group.root) !== group.root || !Array.isArray(group.pages)) { unsupported(appFile, 'invalid subpackage registration') }
      return { ...group, pages: group.pages.map(path => page(path, group.root)) }
    })
  }
  pagesJson.globalStyle = pageStyle(app.window ?? {}, appFile)
  if (app.tabBar) {
    object(app.tabBar, appFile, 'tabBar')
    if (app.tabBar.custom || !Array.isArray(app.tabBar.list)) { unsupported(appFile, 'only the native built-in tab bar is supported') }
    const assetUrl = assetResolver(appFile)
    pagesJson.tabBar = {
      ...app.tabBar,
      list: app.tabBar.list.map((tab) => {
        if (!app.pages.includes(tab.pagePath)) { unsupported(appFile, `tab page is not in the main package: ${tab.pagePath}`) }
        const result = { ...tab }
        for (const key of ['iconPath', 'selectedIconPath']) {
          if (result[key]) {
            const url = assetUrl(result[key])
            if (!url) { unsupported(appFile, 'tab icons must be collected static assets') }
            result[key] = url.slice(1)
          }
        }
        return result
      }),
    }
  }
  for (const [key, value] of Object.entries(app)) {
    if (['$schema', 'pages', 'subPackages', 'subpackages', 'window', 'tabBar'].includes(key)) { continue }
    if (appPlatformOptions[key] !== value) { unsupported(appFile, `app configuration ${key} needs a manifest conversion`) }
  }
  const configFile = framework === 'taro' ? 'src/app.config.ts' : 'src/pages.json'
  operations.push({ file: configFile, operation: `Generate ${framework} routes, subpackages, page settings and tab assets from native app/page JSON.` })

  for (const [file, original] of files) {
    const records = new Set()
    const record = operation => records.add(operation)
    const assetUrl = assetResolver(file)
    let destination = assets.get(file) ?? file
    let content = original
    if (components.has(file)) {
      const source = original.toString()
      const { descriptor, config } = components.get(file)
      const edits = []
      let globalImports = ''
      const isApp = file === appFile
      const emptyAppScript = isApp && !descriptor.scriptSetup?.content.trim()
      const isPage = pages.has(file.slice(4, -4))
      const metadata = isApp || isPage ? {} : componentMetadata(config, file)
      const events = isApp ? { keyboard: false, input: false } : convertTemplate(descriptor.template, file, assetUrl, edits, record, framework)
      if ((events.keyboard || events.input) && /\bretailDomVue\b/.test(source)) { unsupported(file, 'H5 DOM adapter import name is already in use') }
      const extraScript = events.keyboard || events.input ? h5DomHelper(events.input, framework) : ''
      if (descriptor.scriptSetup && !emptyAppScript) {
        const script = descriptor.scriptSetup
        edits.push({ start: script.loc.start.offset, end: script.loc.end.offset, text: convertScript(script.content, file, assetUrl, metadata, record, framework) + extraScript })
      }
      else if (extraScript || Object.keys(metadata).length) {
        const options = convertScript('', file, assetUrl, metadata, record, framework)
        edits.push({ start: 0, end: 0, text: `<script setup lang="ts">\n${options}${extraScript}</script>\n` })
      }
      for (const block of descriptor.customBlocks) { edits.push({ ...blockRange(source, block), text: '' }) }
      if (descriptor.customBlocks.length) { record(`Move native JSON to ${framework} configuration or Vue component options.`) }
      if (isApp) {
        destination = 'src/App.vue'
        if (descriptor.template) { edits.push({ ...blockRange(source, descriptor.template), text: '' }) }
        if (emptyAppScript) {
          const range = descriptor.scriptSetup ? blockRange(source, descriptor.scriptSetup) : { start: 0, end: 0 }
          edits.push({ ...range, text: '<script lang="ts">\nexport default {}\n</script>\n' })
          record('Add the Vue component export for the style-only app root.')
        }
        for (const path of ['src/styles.css', 'src/styles/varo.css']) {
          if (!files.has(path)) { unsupported(file, `missing global stylesheet ${path}`) }
        }
        const registryStyles = [...files.keys()].filter(path => path.startsWith('src/styles/') && path.endsWith('.css')).sort((left, right) => left === 'src/styles/varo.css' ? -1 : right === 'src/styles/varo.css' ? 1 : left.localeCompare(right))
        globalImports = `\n${['src/styles.css', ...registryStyles].map(path => `@import './${path.slice(4)}';`).join('\n')}\n`
        if (framework === 'taro') {
          // Taro constparse expands this token even inside custom-property names,
          // so use its CSS constant rather than var(--taro-tabbar-height).
          globalImports += '\n.taro_tabbar_page { --varo-retail-bottom: calc(taro-tabbar-height + env(safe-area-inset-bottom, 0px)); }\n'
          record('Use the Taro H5 tab-page scope and compiler tab-bar constant for footer clearance; other pages retain zero offset.')
        }
        const style = descriptor.styles[0]
        if (style?.scoped) { unsupported(file, 'app styles must be global') }
        if (!style) { edits.push({ start: source.length, end: source.length, text: `\n<style>${globalImports}</style>\n` }) }
        record(`Rename app to App.vue; let ${framework} own page rendering and import global styles before retail overrides.`)
      }
      for (const style of descriptor.styles) {
        const css = (style === descriptor.styles[0] ? globalImports : '') + convertCss(style.content, file, assetUrl, record, framework)
        if (css !== style.content) { edits.push({ start: style.loc.start.offset, end: style.loc.end.offset, text: css }) }
      }
      content = editRanges(source, edits, file)
    }
    else if (scriptExtensions.has(posix.extname(file))) { content = convertScript(original.toString(), file, assetUrl, undefined, record, framework) }
    else if (file.endsWith('.css')) {
      content = convertCss(original.toString(), file, assetUrl, record, framework)
      if (file === 'src/styles.css') {
        content += '\n@source \'./**/*.{vue,ts}\';\n@source not \'../node_modules\';\n@source not \'../dist\';\n'
        if (framework === 'uni-app') { content += '@source not \'./uni_modules\';\n' }
        record('Limit Tailwind discovery to exported source, including copied pure helpers.')
      }
    }
    else if (!assets.has(file)) { unsupported(file, `source kind has no approved ${framework} conversion`) }
    if (destination !== file && destination !== 'src/App.vue') { record(`Move ${file} to ${destination} for static asset copying.`) }
    if (converted.has(destination)) { unsupported(file, `converted path collision at ${destination}`) }
    converted.set(destination, content)
    for (const operation of records) { operations.push({ file: destination, operation }) }
  }
  if (framework === 'taro') {
    const config = {
      pages: pagesJson.pages.map(page => page.path),
      window: pagesJson.globalStyle,
      ...(pagesJson.subPackages ? { subPackages: pagesJson.subPackages.map(group => ({ ...group, pages: group.pages.map(page => page.path) })) } : {}),
      ...(pagesJson.tabBar ? { tabBar: pagesJson.tabBar } : {}),
      ...appPlatformOptions,
    }
    converted.set(configFile, `export default defineAppConfig(${JSON.stringify(config, null, 2)})\n`)
  }
  else { converted.set(configFile, `${JSON.stringify(pagesJson, null, 2)}\n`) }
  // Publish only a complete conversion. Rejection leaves both caller-owned inputs untouched.
  files.clear()
  for (const [file, content] of converted) { files.set(file, content) }
  transforms.push(...operations)
  return files
}
