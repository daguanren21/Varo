export interface WxmlDependencyReference {
  kind: 'template' | 'script'
  specifier: string
}

export interface WxmlScanResult {
  assets: string[]
  dependencies: WxmlDependencyReference[]
  tags: string[]
}

export interface CssImportReference {
  end: number
  specifier: string
  start: number
}

export interface CssUrlReference {
  end: number
  specifier: string
  start: number
}

export interface CssScanResult {
  imports: CssImportReference[]
  urls: CssUrlReference[]
}

const assetExtensions: Record<string, true> = {
  '.avif': true,
  '.bmp': true,
  '.eot': true,
  '.gif': true,
  '.ico': true,
  '.jpeg': true,
  '.jpg': true,
  '.mp3': true,
  '.mp4': true,
  '.ogg': true,
  '.otf': true,
  '.png': true,
  '.svg': true,
  '.ttf': true,
  '.wav': true,
  '.webm': true,
  '.webp': true,
  '.woff': true,
  '.woff2': true,
}

const assetAttributeNames: Record<string, true> = {
  background: true,
  icon: true,
  poster: true,
  src: true,
  thumb: true,
}

function isWhitespace(character: string | undefined): boolean {
  return character === ' ' || character === '\n' || character === '\r' || character === '\t' || character === '\f'
}

function skipWhitespace(source: string, offset: number): number {
  let cursor = offset
  while (isWhitespace(source[cursor])) { cursor += 1 }
  return cursor
}

function skipCssTrivia(source: string, offset: number): number {
  let cursor = offset
  while (cursor < source.length) {
    cursor = skipWhitespace(source, cursor)
    if (!source.startsWith('/*', cursor)) { break }
    const commentEnd = source.indexOf('*/', cursor + 2)
    if (commentEnd < 0) { throw new Error('Unterminated CSS comment') }
    cursor = commentEnd + 2
  }
  return cursor
}

interface QuotedCssValue {
  end: number
  specifier: string
  valueEnd: number
  valueStart: number
}

function readQuotedCssValue(source: string, offset: number): QuotedCssValue {
  const quote = source[offset]
  if (quote !== '"' && quote !== '\'') { throw new Error('Expected a quoted CSS value') }
  let cursor = offset + 1
  while (cursor < source.length) {
    const character = source[cursor]
    if (character === '\\') {
      throw new Error('Escaped CSS asset paths are not supported; use a literal path')
    }
    if (character === quote) {
      return {
        end: cursor + 1,
        specifier: source.slice(offset + 1, cursor),
        valueEnd: cursor,
        valueStart: offset + 1,
      }
    }
    cursor += 1
  }
  throw new Error('Unterminated CSS string')
}

function skipQuotedCssString(source: string, offset: number): number {
  const quote = source[offset]
  if (quote !== '"' && quote !== '\'') { throw new Error('Expected a quoted CSS string') }
  let cursor = offset + 1
  while (cursor < source.length) {
    if (source[cursor] === '\\') {
      cursor += 2
      continue
    }
    if (source[cursor] === quote) { return cursor + 1 }
    cursor += 1
  }
  throw new Error('Unterminated CSS string')
}

interface ParsedCssUrl extends CssUrlReference {
  ruleEnd: number
}

function readCssUrl(source: string, offset: number): ParsedCssUrl | null {
  if (source.slice(offset, offset + 3).toLowerCase() !== 'url') { return null }
  const previous = source[offset - 1]
  const following = source[offset + 3]
  if ((previous && /[\w-]/.test(previous)) || (following && /[\w-]/.test(following))) { return null }
  let cursor = skipCssTrivia(source, offset + 3)
  if (source[cursor] !== '(') { return null }
  cursor = skipCssTrivia(source, cursor + 1)
  if (source[cursor] === '"' || source[cursor] === '\'') {
    const quoted = readQuotedCssValue(source, cursor)
    cursor = skipCssTrivia(source, quoted.end)
    if (source[cursor] !== ')') { throw new Error('Expected ")" after CSS url()') }
    return {
      end: quoted.valueEnd,
      ruleEnd: cursor + 1,
      specifier: quoted.specifier,
      start: quoted.valueStart,
    }
  }
  const valueStart = cursor
  while (cursor < source.length && source[cursor] !== ')') {
    if (source[cursor] === '\\') {
      throw new Error('Escaped CSS asset paths are not supported; use a literal path')
    }
    cursor += 1
  }
  if (source[cursor] !== ')') { throw new Error('Unterminated CSS url()') }
  let valueEnd = cursor
  while (valueEnd > valueStart && isWhitespace(source[valueEnd - 1])) { valueEnd -= 1 }
  return {
    end: valueEnd,
    ruleEnd: cursor + 1,
    specifier: source.slice(valueStart, valueEnd),
    start: valueStart,
  }
}

function readCssImport(source: string, offset: number): CssImportReference | null {
  if (source.slice(offset, offset + 7).toLowerCase() !== '@import') { return null }
  const following = source[offset + 7]
  if (following && /[\w-]/.test(following)) { return null }
  let cursor = skipCssTrivia(source, offset + 7)
  let specifier: string
  if (source[cursor] === '"' || source[cursor] === '\'') {
    const quoted = readQuotedCssValue(source, cursor)
    specifier = quoted.specifier
    cursor = quoted.end
  }
  else {
    const parsedUrl = readCssUrl(source, cursor)
    if (!parsedUrl) { throw new Error('CSS @import must use a quoted path or url()') }
    specifier = parsedUrl.specifier
    cursor = parsedUrl.ruleEnd
  }
  cursor = skipCssTrivia(source, cursor)
  if (source[cursor] !== ';') {
    throw new Error('CSS @import media modifiers are not supported in WXSS; import a plain local stylesheet')
  }
  return { end: cursor + 1, specifier, start: offset }
}

export function scanCss(source: string): CssScanResult {
  const imports: CssImportReference[] = []
  const urls: CssUrlReference[] = []
  let cursor = 0
  while (cursor < source.length) {
    if (source.startsWith('/*', cursor)) {
      const commentEnd = source.indexOf('*/', cursor + 2)
      if (commentEnd < 0) { throw new Error('Unterminated CSS comment') }
      cursor = commentEnd + 2
      continue
    }
    if (source[cursor] === '"' || source[cursor] === '\'') {
      cursor = skipQuotedCssString(source, cursor)
      continue
    }
    if (source[cursor] === '@') {
      const parsedImport = readCssImport(source, cursor)
      if (parsedImport) {
        imports.push({ end: parsedImport.end, specifier: parsedImport.specifier, start: parsedImport.start })
        cursor = parsedImport.end
        continue
      }
    }
    const parsedUrl = readCssUrl(source, cursor)
    if (parsedUrl) {
      urls.push({ end: parsedUrl.end, specifier: parsedUrl.specifier, start: parsedUrl.start })
      cursor = parsedUrl.ruleEnd
      continue
    }
    cursor += 1
  }
  return { imports, urls }
}

interface WxmlAttribute {
  name: string
  value?: string
}

interface WxmlTag {
  attributes: WxmlAttribute[]
  end: number
  name: string
  selfClosing: boolean
}

function isWxmlNameCharacter(character: string | undefined): boolean {
  return character !== undefined && /[\w:.-]/.test(character)
}

function readWxmlTag(source: string, offset: number): WxmlTag | null {
  if (source[offset] !== '<') { return null }
  if (source.startsWith('<!--', offset)) {
    const commentEnd = source.indexOf('-->', offset + 4)
    if (commentEnd < 0) { throw new Error('Unterminated WXML comment') }
    return { attributes: [], end: commentEnd + 3, name: '', selfClosing: false }
  }
  if (source.startsWith('<![CDATA[', offset)) {
    const cdataEnd = source.indexOf(']]>', offset + 9)
    if (cdataEnd < 0) { throw new Error('Unterminated WXML CDATA section') }
    return { attributes: [], end: cdataEnd + 3, name: '', selfClosing: false }
  }
  let cursor = offset + 1
  if (source[cursor] === '/' || source[cursor] === '!' || source[cursor] === '?') {
    const tagEnd = source.indexOf('>', cursor + 1)
    if (tagEnd < 0) { throw new Error('Unterminated WXML tag') }
    return { attributes: [], end: tagEnd + 1, name: '', selfClosing: false }
  }
  cursor = skipWhitespace(source, cursor)
  const nameStart = cursor
  while (isWxmlNameCharacter(source[cursor])) { cursor += 1 }
  if (cursor === nameStart) { return null }
  const name = source.slice(nameStart, cursor).toLowerCase()
  const attributes: WxmlAttribute[] = []
  while (cursor < source.length) {
    cursor = skipWhitespace(source, cursor)
    if (source[cursor] === '>') { return { attributes, end: cursor + 1, name, selfClosing: false } }
    if (source[cursor] === '/' && source[cursor + 1] === '>') { return { attributes, end: cursor + 2, name, selfClosing: true } }
    const attributeStart = cursor
    while (isWxmlNameCharacter(source[cursor])) { cursor += 1 }
    if (cursor === attributeStart) { throw new Error(`Unexpected token in <${name}>`) }
    const attributeName = source.slice(attributeStart, cursor).toLowerCase()
    cursor = skipWhitespace(source, cursor)
    if (source[cursor] !== '=') {
      attributes.push({ name: attributeName })
      continue
    }
    cursor = skipWhitespace(source, cursor + 1)
    const quote = source[cursor]
    if (quote !== '"' && quote !== '\'') { throw new Error(`Attribute ${attributeName} on <${name}> must be quoted`) }
    const valueStart = cursor + 1
    cursor = valueStart
    while (cursor < source.length && source[cursor] !== quote) { cursor += 1 }
    if (source[cursor] !== quote) { throw new Error(`Unterminated ${attributeName} attribute on <${name}>`) }
    attributes.push({ name: attributeName, value: source.slice(valueStart, cursor) })
    cursor += 1
  }
  throw new Error(`Unterminated <${name}> tag`)
}

export function looksLikeAssetReference(value: string): boolean {
  const withoutSuffix = value.split(/[?#]/, 1)[0] ?? ''
  const slash = withoutSuffix.lastIndexOf('/')
  const dot = withoutSuffix.lastIndexOf('.')
  return dot > slash && assetExtensions[withoutSuffix.slice(dot).toLowerCase()] === true
}

export function scanWxml(source: string): WxmlScanResult {
  const assets: string[] = []
  const dependencies: WxmlDependencyReference[] = []
  const tags = new Set<string>()
  let cursor = 0
  while (cursor < source.length) {
    const tagStart = source.indexOf('<', cursor)
    if (tagStart < 0) { break }
    const tag = readWxmlTag(source, tagStart)
    if (!tag) {
      cursor = tagStart + 1
      continue
    }
    cursor = tag.end
    if (!tag.name) { continue }
    tags.add(tag.name)
    let hasExternalWxs = false
    for (const attribute of tag.attributes) {
      if (attribute.value === undefined || attribute.value.includes('{{') || attribute.value.includes('}}')) { continue }
      if (attribute.name === 'src' && (tag.name === 'import' || tag.name === 'include' || tag.name === 'wxs')) {
        if (!attribute.value) { throw new Error(`<${tag.name}> src must not be empty`) }
        dependencies.push({
          kind: tag.name === 'wxs' ? 'script' : 'template',
          specifier: attribute.value,
        })
        if (tag.name === 'wxs') { hasExternalWxs = true }
        continue
      }
      if (attribute.name === 'style') {
        for (const reference of scanCss(attribute.value).urls) { assets.push(reference.specifier) }
      }
      else if (assetAttributeNames[attribute.name] && (/^(?:data|https):/i.test(attribute.value) || looksLikeAssetReference(attribute.value))) {
        assets.push(attribute.value)
      }
    }
    if (tag.name === 'wxs' && !tag.selfClosing && !hasExternalWxs) {
      const closingTag = '</wxs>'
      const closingOffset = source.indexOf(closingTag, cursor)
      if (closingOffset < 0) { throw new Error('Inline <wxs> is missing its closing tag') }
      cursor = closingOffset + closingTag.length
    }
  }
  return { assets, dependencies, tags: [...tags] }
}
