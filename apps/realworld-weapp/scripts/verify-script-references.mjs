import { readFile, stat } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import ts from 'typescript'

export async function verifyScriptReferences(outputRoot, subPackages, files) {
  const roots = [...subPackages].sort((left, right) => right.root.length - left.root.length)
  const outputName = path => relative(outputRoot, path).split(sep).join('/')
  const packageOwner = path => roots.find(pkg => outputName(path).startsWith(`${pkg.root}/`))
  let count = 0

  for (const path of files) {
    const source = ts.createSourceFile(path, await readFile(path, 'utf8'), ts.ScriptTarget.Latest, false, ts.ScriptKind.JS)
    if (source.parseDiagnostics.length) { throw new Error(`Invalid compiled JavaScript: ${outputName(path)}`) }
    const references = new Set()
    function visit(node) {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) { references.add(node.moduleSpecifier.text) }
      }
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'require') {
        const argument = node.arguments[0]
        if (!argument || !ts.isStringLiteralLike(argument)) {
          throw new Error(`Cannot verify dynamic synchronous script dependency in ${outputName(path)}`)
        }
        references.add(argument.text)
      }
      ts.forEachChild(node, visit)
    }
    visit(source)

    for (const reference of references) {
      if (!reference.startsWith('.') && !reference.startsWith('/')) {
        throw new Error(`Unbundled script dependency in ${outputName(path)}: ${reference}`)
      }
      const targetPath = reference.startsWith('/')
        ? resolve(outputRoot, `.${reference}`)
        : resolve(dirname(path), reference)
      const targetName = outputName(targetPath)
      if (!targetName || targetName === '..' || targetName.startsWith('../') || isAbsolute(targetName)) {
        throw new Error(`Native reference escapes output: ${outputName(path)} -> ${reference}`)
      }
      const owner = packageOwner(path)
      const target = packageOwner(targetPath)
      if (owner !== target && (target || owner?.independent)) {
        throw new Error(`Forbidden synchronous package reference: ${outputName(path)} (${owner?.root ?? 'main'}) -> ${targetName} (${target?.root ?? 'main'})`)
      }
      const targetStat = await stat(targetPath).catch((error) => {
        if (error.code === 'ENOENT') { return undefined }
        throw error
      })
      if (!targetStat?.isFile()) {
        throw new Error(`Unresolved generated JS import: ${outputName(path)} -> ${reference}`)
      }
      count += 1
    }
  }
  return count
}
