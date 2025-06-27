import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'docs/js/game.js',
      format: 'iife',
      name: 'UniversalPaperclips',
      sourcemap: !production,
    },
    {
      file: 'docs/js/game.min.js',
      format: 'iife',
      name: 'UniversalPaperclips',
      plugins: [terser()],
      sourcemap: false,
    }
  ],
  plugins: [
    nodeResolve({
      browser: true,
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          targets: {
            browsers: ['> 0.5%', 'last 2 versions', 'Firefox ESR', 'not dead']
          }
        }]
      ]
    }),
  ],
  watch: {
    clearScreen: false,
  }
};