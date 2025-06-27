const { nodeResolve } = require('@rollup/plugin-node-resolve');
const babel = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser');

const production = !process.env.ROLLUP_WATCH;

module.exports = {
  input: 'src/index.js',
  output: [
    {
      dir: 'docs/js',
      format: 'es',
      sourcemap: !production,
      entryFileNames: 'game.js',
      chunkFileNames: '[name]-[hash].js',
      // Preserve modules for dynamic imports
      preserveModules: false,
      // Manual chunks for better code splitting
      manualChunks: {
        'phase-space': ['src/game/systems/swarm.js', 'src/game/systems/exploration.js'],
      },
    },
    {
      dir: 'docs/js/min',
      format: 'es',
      plugins: [terser()],
      sourcemap: false,
      entryFileNames: 'game.min.js',
      chunkFileNames: '[name]-[hash].min.js',
      preserveModules: false,
      manualChunks: {
        'phase-space': ['src/game/systems/swarm.js', 'src/game/systems/exploration.js'],
      },
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