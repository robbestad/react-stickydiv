import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: {
    esm: {},
    cjs: {
      outputOptions: {
        exports: 'named',
        // 3.x was `module.exports = StickyDiv`. Keep that while also
        // exposing `.StickyDiv` / `.default` for named access.
        footer: [
          'module.exports = exports.default;',
          'module.exports.StickyDiv = exports.default;',
          'module.exports.default = exports.default;',
        ].join('\n'),
      },
    },
  },
  dts: true,
  sourcemap: true,
  clean: true,
  platform: 'neutral',
})
