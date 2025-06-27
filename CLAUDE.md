# CLAUDE.md

This file provides guidance to Claude Code when working with the Universal Paperclips codebase.

## Project Overview

Universal Paperclips is a browser-based incremental game by Frank Lantz and Bennett Foddy. This repository contains a modernized version that maintains the original gameplay while upgrading the codebase with ES6 modules, comprehensive testing, and modern development practices.

**Live Game**: https://williamzujkowski.github.io/paperclips/

## Current State

- ✅ Base game is functional with modernized code
- ✅ Complete ES6 module architecture
- ✅ Comprehensive test suite (102 tests)
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
│   │   │   ├── performanceMonitor.js # Performance tracking
│   │   │   ├── memoryMonitor.js  # Memory leak detection
│   │   │   └── phaseManager.js   # Lazy loading controller
│   │   ├── systems/       # Game systems
│   │   │   ├── production.js     # Paperclip production
│   │   │   ├── market.js         # Economic system
│   │   │   ├── computing.js      # Processors & operations
│   │   │   ├── combat.js         # Space battles
│   │   │   ├── projects.js       # Research projects
│   │   │   ├── swarm.js          # Space probe swarm
│   │   │   └── exploration.js    # Space exploration
│   │   ├── ui/            # User interface
│   │   │   ├── renderer.js       # DOM rendering
│   │   │   ├── events.js         # Event handlers
│   │   │   ├── domBatcher.js     # DOM update batching
│   │   │   └── devDashboard.js   # Development tools UI
│   │   └── utils/         # Utilities
│   │       ├── formatting.js     # Number formatting
│   │       └── memoryProfiler.js # Memory profiling tools
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
│   │   ├── deploy.yml   # Deploy to GitHub Pages
│   │   └── release.yml  # Create releases on tags
├── .husky/              # Git hooks
├── package.json         # Dependencies and scripts
├── rollup.config.js     # Build configuration
├── jest.config.js       # Test configuration
├── .eslintrc.json      # Linting rules
├── .prettierrc         # Code formatting
├── sw.js               # Service Worker
└── manifest.json       # Web App Manifest
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev
# Open http://localhost:8080

# Build for production
npm run build

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
- **Test Suite**: Jest with 102 unit tests
- **Code Quality**: ESLint + Prettier with pre-commit hooks
- **Type Safety**: JSDoc annotations throughout
- **CI/CD**: Automated testing and deployment

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

### Development Dashboard
Press `Ctrl+Shift+D` to open the development dashboard which includes:
- Real-time performance metrics (FPS, frame time)
- Game state viewer with search
- Error log with stack traces
- DOM batching statistics
- Memory monitoring and profiling
- Debug controls (add resources, unlock features)

The dashboard persists across page reloads and can be minimized.

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
3. ✅ Added comprehensive test suite (102 tests)
4. ✅ Implemented error handling and recovery
5. ✅ Added performance monitoring
6. ✅ Set up CI/CD pipeline
7. ✅ Added pre-commit hooks
8. ✅ Documented with JSDoc
9. ✅ Created save/load system with import/export
10. ✅ Implemented lazy loading (30% bundle size reduction)
11. ✅ Added memory monitoring and profiling tools
12. ✅ Created development dashboard (Ctrl+Shift+D)
13. ✅ Implemented object pooling for performance
14. ✅ Added Service Worker for offline play
15. ✅ Created version management system

## All 11 Phases Complete! 🎉

The modernization project is now complete with all planned features implemented.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Test Coverage (102 tests)
- **GameState**: State management, save/load, import/export
- **ProductionSystem**: Clip manufacturing, automation, costs
- **MarketSystem**: Pricing, demand, marketing
- **ComputingSystem**: Processors, memory, operations, quantum
- **CombatSystem**: Battles, honor, upgrades, object pooling
- **Formatting**: Number formatting, currency, duration
- **Error Handling**: Error boundaries, recovery
- **Performance**: Metrics tracking, thresholds
- **Memory Monitor**: Leak detection, memory tracking
- **DOM Batching**: Update queuing, element caching

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