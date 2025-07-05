import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import livereload from 'rollup-plugin-livereload';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.js',
  output: {
    file: 'docs/js/bundle.js',
    format: 'iife',
    name: 'UniversalPaperclips',
    sourcemap: !production,
    globals: {}
  },
  plugins: [
    // Resolve node modules
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    
    // Convert CommonJS modules to ES6
    commonjs(),
    
    // Transpile ES6+ to ES5
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          targets: {
            browsers: ['> 1%', 'last 2 versions', 'not dead']
          }
        }]
      ]
    }),
    
    // Copy static assets
    copy({
      targets: [
        { 
          src: 'src/index.html', 
          dest: 'docs',
          transform: (contents) => {
            let html = contents.toString();
            
            // Remove existing script tags
            html = html.replace(/<script[^>]*><\/script>/g, '');
            
            // Add livereload script in development
            if (!production) {
              html = html.replace('</head>', 
                '  <script src="http://localhost:35729/livereload.js?snipver=1"></script>\n</head>');
            }
            
            // Add bundle script
            html = html.replace('</body>', '<script src="js/bundle.js"></script>\n</body>');
            
            return html;
          }
        },
        { src: 'src/styles/*.css', dest: 'docs/css' }
      ]
    }),
    
    // Minify in production
    production && terser({
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }),
    
    // Live reload in development
    !production && livereload({
      watch: ['docs', 'src'],
      delay: 300,
      port: 35729,
      verbose: false
    })
  ],
  
  watch: {
    clearScreen: false,
    include: 'src/**',
    exclude: 'node_modules/**',
    chokidar: {
      ignoreInitial: true,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 10
      }
    }
  }
};