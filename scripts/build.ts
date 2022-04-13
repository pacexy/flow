import { defineConfig, rollup } from 'rollup'
import dts from 'rollup-plugin-dts'
import typescript from 'rollup-plugin-typescript2'

const opts = defineConfig([
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.mjs', format: 'esm' },
      { file: 'dist/index.js', format: 'cjs', exports: 'auto' },
    ],
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            paths: [],
          },
        },
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts' },
    plugins: [dts()],
  },
])

async function main() {
  await Promise.all(
    opts.map(async (opt) => {
      const bundle = await rollup(opt)
      const outputOpts = Array.isArray(opt.output) ? opt.output : [opt.output]
      // @ts-ignore
      await Promise.all(outputOpts.map(bundle.write))
      await bundle.close()
    }),
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
