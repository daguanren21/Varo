import { tokenize, TokenType } from '@csstools/css-tokenizer'

// Work with decoded CSS tokens; raw spelling is never a filesystem path.
export function cssReferences(source, { importRule = false, from = 'stylesheet' } = {}) {
  const tokens = tokenize({ css: source }, {
    onParseError(error) { throw new Error(`Invalid compiled CSS in ${from}: ${error.message}`, { cause: error }) },
  })
  const references = []
  const next = (index) => {
    while (tokens[index]?.[0] === TokenType.Whitespace || tokens[index]?.[0] === TokenType.Comment) { index++ }
    return index
  }
  for (let index = next(0); index < tokens.length; index++) {
    const token = tokens[index]
    let reference
    if (token[0] === TokenType.URL || (importRule && token[0] === TokenType.String)) {
      reference = token
    }
    else if (token[0] === TokenType.Function && token[4].value.toLowerCase() === 'url') {
      const valueIndex = next(index + 1)
      const endIndex = next(valueIndex + 1)
      if (tokens[valueIndex]?.[0] !== TokenType.String || tokens[endIndex]?.[0] !== TokenType.CloseParen) {
        throw new Error(`Unsupported compiled CSS URL in ${from}: ${source}`)
      }
      reference = tokens[valueIndex]
      index = endIndex
    }
    if (reference) {
      references.push({
        value: reference[4].value,
        start: reference[2],
        end: reference[3] + 1,
        kind: reference[0] === TokenType.URL ? 'url' : 'string',
      })
    }
    if (importRule) {
      if (!reference) { throw new Error(`Unsupported compiled style import in ${from}: ${source}`) }
      break
    }
  }
  return references
}

export function localCssReference(value) {
  if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value) || value.includes('{{')) { return undefined }
  const suffixIndex = value.search(/[?#]/)
  return suffixIndex < 0
    ? { path: value, suffix: '' }
    : { path: value.slice(0, suffixIndex), suffix: value.slice(suffixIndex) }
}

function cssString(value) {
  let result = '"'
  let offset = 0
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index)
    if (code > 0x1F && code !== 0x7F && code !== 0x22 && code !== 0x5C) { continue }
    result += value.slice(offset, index)
    result += code === 0x22 || code === 0x5C ? `\\${value[index]}` : `\\${code.toString(16)} `
    offset = index + 1
  }
  return `${result}${value.slice(offset)}"`
}

export function rewriteCssReferences(source, references, map) {
  let result = ''
  let offset = 0
  for (const reference of references) {
    const local = localCssReference(reference.value)
    if (!local) { continue }
    const value = `${map(local.path)}${local.suffix}`
    if (value === reference.value) { continue }
    const replacement = cssString(value)
    result += source.slice(offset, reference.start) + (reference.kind === 'url' ? `url(${replacement})` : replacement)
    offset = reference.end
  }
  return offset ? result + source.slice(offset) : source
}
