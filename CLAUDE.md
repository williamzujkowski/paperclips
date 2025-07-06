# CLAUDE.md

This file provides guidance to Claude Code when working with the Universal Paperclips codebase.

## Project Overview

Universal Paperclips is a browser-based incremental game by Frank Lantz and Bennett Foddy. This repository contains a modernized version that maintains the original gameplay while upgrading the codebase with ES6 modules, comprehensive testing, and modern development practices.

**Live Game**: https://williamzujkowski.github.io/paperclips/

## Current State

- ✅ Base game is functional with modernized code
- ✅ Complete ES6 module architecture
- ✅ Comprehensive test suite (89+ tests)
- ✅ Error handling and performance monitoring
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Pre-commit hooks with Husky
- ✅ JSDoc documentation throughout

## Key Files & Structure

```
paperclips/
├── src/                    # Modern source code
│   ├── index.js           # Main entry point
│   ├── game/
│   │   ├── core/          # Core systems
│   │   │   ├── gameState.js      # Centralized state management
│   │   │   ├── gameLoop.js       # Main game loop
│   │   │   ├── constants.js      # Game constants
│   │   │   ├── errorHandler.js   # Error handling system
│   │   │   └── performanceMonitor.js # Performance tracking
│   │   ├── systems/       # Game systems
│   │   │   ├── production.js     # Paperclip production
│   │   │   ├── market.js         # Economic system
│   │   │   ├── computing.js      # Processors & operations
│   │   │   ├── combat.js         # Space battles
│   │   │   └── projects.js       # Research projects
│   │   ├── ui/            # User interface
│   │   │   ├── renderer.js       # DOM rendering
│   │   │   └── events.js         # Event handlers
│   │   └── utils/         # Utilities
│   │       └── formatting.js     # Number formatting
├── tests/                 # Test suite
│   └── unit/             # Unit tests for all systems
├── docs/                  # GitHub Pages deployment
│   ├── index.html        # Game HTML
│   ├── js/               # Built JavaScript
│   └── [legacy files]    # Original game files
├── scripts/              # Build and dev scripts
├── .github/              # CI/CD workflows
│   ├── workflows/
│   │   ├── test.yml     # Run tests on PR/push
│   │   └── deploy.yml   # Deploy to GitHub Pages
├── .husky/              # Git hooks
├── package.json         # Dependencies and scripts
├── rollup.config.js     # Build configuration
├── babel.config.cjs     # Babel configuration (CommonJS)
├── jest.config.cjs      # Test configuration (CommonJS)
├── .eslintrc.cjs        # Linting rules (CommonJS)
└── .prettierrc         # Code formatting
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev           # Full development mode with auto-open browser
npm run dev:quiet     # Silent mode without auto-open
# Open http://localhost:8080 (if not auto-opened)

# Build for production
npm run build         # Single build
npm run build:watch   # Build with file watching

# Run tests
npm test
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report

# Code quality
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
npm run format        # Format with Prettier

# Deployment
git add -A
git commit -m "Your message"  # Pre-commit hooks run automatically
git push                       # CI/CD deploys to GitHub Pages
```

## Architecture Overview

The game has been modernized from a global variable-based architecture to a modular ES6 system.

### Legacy Architecture (Original)
- 200+ global variables
- Direct DOM manipulation
- Inline event handlers
- No build process
- No error handling
- No tests

### Modern Architecture (Current)
- **ES6 Modules**: Clear separation of concerns
- **State Management**: Centralized GameState class with dot notation access
- **Game Systems**: Encapsulated systems for each game mechanic
- **Error Handling**: Global error boundaries with automatic recovery
- **Performance Monitoring**: FPS tracking and performance metrics
- **Build Pipeline**: Rollup with tree-shaking and minification
- **Test Suite**: Jest with 89+ unit tests
- **Code Quality**: ESLint + Prettier with pre-commit hooks
- **Type Safety**: JSDoc annotations throughout
- **CI/CD**: Automated testing (Node 16.x, 18.x, 20.x matrix) and deployment

## Important Patterns

### Adding New Features
1. Create module in `src/game/systems/`
2. Add state properties to GameState constructor
3. Register update/render handlers in game loop
4. Add UI elements to index.html
5. Add event handlers in `src/game/ui/events.js`
6. Write tests in `tests/unit/`
7. Add JSDoc documentation

### State Management
```javascript
// Get value
const clips = gameState.get('resources.clips');

// Set value
gameState.set('resources.clips', 1000);

// Increment/decrement
gameState.increment('resources.clips', 10);
gameState.decrement('resources.wire', 5);

// Access nested properties
const combat = gameState.get('combat.probeCombat');
```

### Error Handling
```javascript
// Log errors with context
errorHandler.handleError(error, 'source.location', { extraData });

// Create error boundary
const safeFn = errorHandler.createErrorBoundary(riskyFn, 'functionName');

// Log levels: debug, info, warn, error
errorHandler.info('Game started');
errorHandler.warn('Low performance detected');
```

### Performance Monitoring
```javascript
// Measure function performance
performanceMonitor.measure(() => {
  // expensive operation
}, 'operationName');

// Get performance report
const report = performanceMonitor.getReport();
```

## Common Tasks

### Run the modern game locally
```bash
npm run dev
# Open http://localhost:8080
# Changes auto-reload!
```

### Deploy to GitHub Pages
```bash
# Automatic deployment:
git add -A
git commit -m "Your changes"
git push  # CI/CD handles the rest

# Manual deployment:
npm run build
git add docs/
git commit -m "Deploy to GitHub Pages"
git push
```

### Debug in Browser Console
```javascript
// View game state
UniversalPaperclips.debug.getState();

// Add resources
UniversalPaperclips.debug.addClips(10000);
UniversalPaperclips.debug.addFunds(1000);

// Check performance
UniversalPaperclips.debug.getPerformance();

// View errors
UniversalPaperclips.debug.getErrors();

// Change log level
UniversalPaperclips.debug.setLogLevel('debug');
```

## Recent Accomplishments

1. ✅ Extracted 200+ global variables into centralized GameState
2. ✅ Converted all major systems to ES6 modules
3. ✅ Added comprehensive test suite (89+ tests)
4. ✅ Implemented error handling and recovery
5. ✅ Added performance monitoring
6. ✅ Set up CI/CD pipeline with enhanced GitHub Actions
7. ✅ Added pre-commit hooks with Husky
8. ✅ Documented with JSDoc
9. ✅ Created save/load system with import/export
10. ✅ Migrated configuration files to CommonJS format (.cjs)
11. ✅ Enhanced CI/CD with matrix testing (Node 16.x, 18.x, 20.x)
12. ✅ Added Codecov integration for coverage reporting

## Next Steps

1. **Optimize Render Performance**: Implement requestAnimationFrame batching
2. ✅ **Hot Module Reload**: Enhanced development experience with livereload
3. **Mobile Optimization**: Responsive design and touch controls
4. **Accessibility**: ARIA labels and keyboard navigation
5. **Achievement System**: Track player milestones
6. **Cloud Saves**: Sync across devices
7. **Mod Support**: Allow community extensions

## Hot Module Reload

The development environment now includes enhanced hot module reload capabilities:

### Features
- **Automatic Browser Refresh**: Changes to source files trigger instant browser reload
- **Livereload Integration**: Watches both `src/` and `docs/` directories
- **Fast Rebuild**: Optimized Rollup configuration with file watching
- **Development Scripts**: Multiple development modes available

### How It Works
1. **File Watching**: Rollup watches all files in `src/` directory
2. **Livereload Server**: Runs on port 35729 and communicates with browser
3. **Automatic Injection**: Livereload script automatically injected in development
4. **HTTP Server**: Serves files from `docs/` with disabled caching

### Development Workflow
```bash
# Start development with hot reload
npm run dev           # Opens browser automatically
npm run dev:quiet     # Silent mode

# Make changes to any file in src/
# Browser automatically refreshes with your changes
```

### Configuration
- **Rollup Config**: Enhanced watch options with chokidar
- **Livereload**: Watches multiple directories with reduced delay
- **HTTP Server**: Configured for development with cache disabled

## Configuration Files

The project uses CommonJS format (.cjs) for configuration files to maintain compatibility while using ES modules for the main codebase:

- **babel.config.cjs**: Babel transpilation configuration
- **jest.config.cjs**: Jest testing framework configuration  
- **.eslintrc.cjs**: ESLint linting rules and environment settings

This approach allows the project to use `"type": "module"` in package.json while still supporting tools that require CommonJS configuration.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Test Coverage
- **GameState**: State management, save/load, import/export
- **ProductionSystem**: Clip manufacturing, automation, costs
- **MarketSystem**: Pricing, demand, marketing
- **ComputingSystem**: Processors, memory, operations, quantum
- **CombatSystem**: Battles, honor, upgrades
- **Formatting**: Number formatting, currency, duration
- **Error Handling**: Error boundaries, recovery
- **Performance**: Metrics tracking, thresholds

### Writing New Tests
```javascript
// tests/unit/newSystem.test.js
import { NewSystem } from '../../src/game/systems/newSystem.js';
import { gameState } from '../../src/game/core/gameState.js';

describe('NewSystem', () => {
  let system;
  
  beforeEach(() => {
    system = new NewSystem();
    gameState.reset();
  });
  
  it('should do something', () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

## Known Issues

1. Mobile responsiveness needs improvement
2. Some legacy UI elements still use inline styles
3. No keyboard shortcuts yet
4. Performance on older devices not optimized

## Resources

- [Original Game](http://www.decisionproblem.com/paperclips/)
- [GitHub Repository](https://github.com/williamzujkowski/paperclips)
- [Live Game](https://williamzujkowski.github.io/paperclips/)
- [Issue Tracker](https://github.com/williamzujkowski/paperclips/issues)

## Performance Considerations

- Game loop runs at 60 FPS with automatic throttling
- UI updates are batched for performance
- Save operations are debounced
- Large numbers use efficient formatting
- Memory leaks prevented with proper cleanup

## Security Notes

- No external dependencies in production
- localStorage is the only persistence mechanism
- All user input is sanitized
- Error boundaries prevent crashes
- CSP headers recommended for deployment

## Commit Message Format

When committing changes, follow this format:
```
<type>: <subject>

<body>

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: feat, fix, docs, style, refactor, test, chore

## Working with Legacy Code

The original game files are preserved in `docs/` directory:
- `docs/main.js` - Original game logic (5,546 lines)
- `docs/projects.js` - Original projects system (2,452 lines)
- `docs/combat.js` - Original combat system (802 lines)
- `docs/globals.js` - Original globals (182 lines)

These files are not used by the modern version but are kept for reference.

## Tips for Future Development

1. **Always add tests** when adding new features
2. **Use the error handler** for all try-catch blocks
3. **Measure performance** for expensive operations
4. **Document with JSDoc** for better IDE support
5. **Follow the existing patterns** for consistency
6. **Check the browser console** for debug tools
7. **Run tests before committing** (pre-commit hook helps)
8. **Update this file** when making architectural changes

Remember: The goal is to maintain the original gameplay while providing a modern, maintainable codebase for future development.