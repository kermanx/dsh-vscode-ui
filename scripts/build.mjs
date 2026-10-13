import { build } from 'esbuild'
import { mkdir, copyFile, readFile } from 'node:fs/promises'
import { iconStyles } from './icons.mjs'

const expandClasses = text => text.replace(/:--class\(([a-zA-Z][\w-]*)\)/g,
  (_, name) => `:is([class^="_${name}_"], [class*=" _${name}_"], [class$="_${name}"], [class*="_${name} "])`)

await mkdir(new URL('../dist/', import.meta.url), { recursive: true })
await copyFile(new URL('../src/index.js', import.meta.url), new URL('../dist/index.js', import.meta.url))
await build({
  entryPoints: ['src/client.js'], outfile: 'dist/client.js', bundle: true,
  external: ['react', '@deepseek-ai/dsh-client-ui-primitives', '@deepseek-ai/dsh-client-store'],
  jsx: 'transform',
  format: 'cjs', platform: 'browser', target: 'es2022', sourcemap: true,
  loader: { '.css': 'text' },
  plugins: [{
    name: 'classic-component-selectors',
    setup(builder) {
      builder.onResolve({ filter: /^classic:icons$/ }, () => ({ path: 'icons', namespace: 'classic' }))
      builder.onLoad({ filter: /.*/, namespace: 'classic' }, async () => ({ contents: expandClasses(await iconStyles()), loader: 'text' }))
      builder.onLoad({ filter: /\.css$/ }, async ({ path }) => ({
        contents: expandClasses(await readFile(path, 'utf8')),
        loader: 'text',
      }))
    },
  }],
  banner: { js: 'window.__ModuleLoader__.load({ id: "dsh-vscode-ui", factory: (require) => { var module = { exports: {} }; var exports = module.exports;' },
  footer: { js: 'return module.exports; } });' },
})
