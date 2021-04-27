import path from 'path'
import fg from 'fast-glob'
import { Compilation, Compiler } from 'webpack'
import { RawSource } from 'webpack-sources'

interface Options {
  baseUrl: Array<string>
  exclude?: Array<string>
}

export class UnusedPlugin {
  private options: Required<Options>

  constructor(options: Options) {
    this.options = {
      baseUrl: options.baseUrl ?? ['src'],
      exclude: options.exclude ?? ['node_module'],
    }
  }

  findUnused(compilation: Compilation, callback) {
    try {
      const fileDependencies = compilation.fileDependencies
      const contextPath = compilation.options.context as string
      const outputDir = compilation.options.output.path as string
      const usedFiles = this.getUsedFiles(contextPath, Array.from(fileDependencies))
      const allFiles = this.getProjectAllFiles(contextPath)
      const unusedFiles = this.getUnusedFilePaths(allFiles, usedFiles)
      const resultBuffer = this.writeOutFile(unusedFiles)
      const outputPath = path.join(outputDir, 'unused-files.txt')
      const outputRelativePath = path.relative(outputDir, outputPath)
      compilation.assets[outputRelativePath] = new RawSource(resultBuffer)
    }
    catch (e) {
      console.error('unused file found error')
    }

    callback()
  }

  removeExcludeItems(context: string, excludePaths: Array<string>, files: Array<string>): Array<string> {
    const excludeAbsolutePath = excludePaths.map(x => path.resolve(context, x))
    return files.filter((filePath) => {
      const isExclude = excludeAbsolutePath.some(x => filePath.startsWith(x))
      return !isExclude
    })
  }

  getUsedFiles(contextPath: string, fileDependencies: Array<string>) {
    const excludePaths = ['node_modules']
    return this.removeExcludeItems(contextPath, excludePaths, fileDependencies)
  }

  getProjectAllFiles(contextPath: string): Array<string> {
    const pattern = this.options.baseUrl.map((rootPath) => {
      return `${path.resolve(contextPath, rootPath)}/**/*`
    })
    return fg.sync(pattern)
  }

  getUnusedFilePaths(allFilePaths: Array<string>, usedFilePaths: Array<string>): Array<string> {
    const allSet = new Set([...allFilePaths])
    const usedSet = new Set([...usedFilePaths])
    for (const item of usedSet) {
      if (allSet.has(item))
        allSet.delete(item)
    }

    return Array.from(allSet)
  }

  writeOutFile(unusedFiles: Array<string>): Buffer {
    const value = unusedFiles.map((path) => {
      return `${path}`
    }).join('\n')
    return Buffer.from(value)
  }

  apply(compiler: Compiler) {
    // webpack 4
    if (compiler.hooks && compiler.hooks.emit) {
      compiler.hooks.emit.tapAsync('UnusedPlugin', this.findUnused.bind(this))
      // webpack 3
    }
    else {
      // @ts-ignore
      compiler.plugin('emit', this.findUnused)
    }
  }
}
