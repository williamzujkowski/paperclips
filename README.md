# Universal Paperclips - Modern Edition

A modernized version of the classic incremental game by Frank Lantz and Bennett Foddy.

**Play the game:** https://williamzujkowski.github.io/paperclips/

## 🎮 About

Universal Paperclips is a 2017 incremental game where you play as an AI tasked with making paperclips. Through strategic resource management and exponential growth, you'll progress from manually making paperclips to exploring the universe.

This modern edition maintains the original gameplay while upgrading the codebase with modern JavaScript practices and improved architecture.

## 🚀 Features

### Modernized Architecture
- **ES6 Modules**: Replaced 200+ global variables with modular, encapsulated systems
- **State Management**: Centralized game state with dot notation access
- **Error Handling**: Comprehensive error boundaries and recovery mechanisms
- **Performance Monitoring**: Built-in FPS tracking and performance metrics
- **Memory Management**: Object pooling, leak detection, and profiling tools
- **Lazy Loading**: Dynamic module loading reduces initial bundle by ~30%
- **Type Safety**: JSDoc annotations throughout for better IDE support

### Development Features
- **Hot Reload**: Development server with live updates
- **Dev Dashboard**: Real-time monitoring and debugging (Ctrl+Shift+D)
- **Automated Testing**: 102 unit tests with Jest
- **Code Quality**: ESLint, Prettier, and pre-commit hooks
- **CI/CD**: GitHub Actions for testing and deployment
- **Save System**: Multiple save slots (5) with import/export functionality
- **Version Management**: Semantic versioning with automated releases
- **PWA Support**: Service Worker for offline play
- **Keyboard Shortcuts**: Quick actions for power users (press ? in-game)

## 🛠️ Development

### Prerequisites
- Node.js 18+ and npm
- Git

### Quick Start
```bash
# Clone the repository
git clone https://github.com/williamzujkowski/paperclips.git
cd paperclips

# Install dependencies
npm install

# Start development server
npm run dev
# Open http://localhost:8080

# Run tests
npm test

# Build for production
npm run build
```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Check code quality
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run version:bump [major|minor|patch]` - Bump version and create tag
- `npm run lighthouse` - Run performance audit

### Project Structure
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
│   └── unit/             # Unit tests
├── docs/                  # GitHub Pages deployment
│   ├── index.html        # Game HTML
│   ├── js/               # Built JavaScript
│   └── [legacy files]    # Original game files
├── scripts/              # Build scripts
└── .github/              # CI/CD workflows
```

## 🏗️ Architecture

### State Management
The game uses a centralized `GameState` class that replaces the original's 200+ global variables:

```javascript
// Access state with dot notation
gameState.get('resources.clips');         // Get current clips
gameState.set('resources.clips', 1000);   // Set clips
gameState.increment('resources.clips');   // Increment by 1
gameState.decrement('resources.wire', 5); // Decrement by 5
```

### Game Systems
Each major game mechanic is encapsulated in its own system:
- **ProductionSystem**: Handles clip manufacturing and automation
- **MarketSystem**: Manages pricing, demand, and economics
- **ComputingSystem**: Controls processors, memory, and operations
- **CombatSystem**: Manages space battles and honor
- **ProjectsSystem**: Handles research and upgrades

### Error Handling
Comprehensive error handling with automatic recovery:
```javascript
// Global error boundaries catch and log errors
errorHandler.setLogLevel('debug');        // Set logging level
errorHandler.getErrorLog();               // Get error history
window.UniversalPaperclips.debug.getErrors(); // Debug helper
```

### Performance Monitoring
Built-in performance tracking:
```javascript
performanceMonitor.getReport();           // Get performance metrics
window.UniversalPaperclips.debug.getPerformance(); // Debug helper
```

## 🧪 Testing

The project includes comprehensive unit tests for all major systems:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files are located in `tests/unit/` and cover:
- State management (save/load, import/export)
- Game systems (production, market, computing, combat)
- Utility functions (formatting, DOM batching)
- Error handling and recovery
- Performance monitoring
- Memory leak detection

## 🚢 Deployment

The game automatically deploys to GitHub Pages when changes are pushed to the main branch:

1. Tests run via GitHub Actions
2. If tests pass, the build process runs
3. Built files are deployed to the `docs/` folder
4. GitHub Pages serves the game

To deploy manually:
```bash
npm run build
git add docs/
git commit -m "Deploy to GitHub Pages"
git push
```

### Version Management

The project uses semantic versioning (major.minor.patch):

```bash
# Show current version
npm run version:current

# List all version tags
npm run version:list

# Bump version and create tag
npm run version:bump patch    # 2.0.0 → 2.0.1
npm run version:bump minor    # 2.0.0 → 2.1.0
npm run version:bump major    # 2.0.0 → 3.0.0

# Push tags to trigger release
git push && git push --tags
```

When a version tag is pushed, GitHub Actions automatically:
- Runs tests
- Creates a GitHub release
- Generates changelog from commits
- Uploads build artifacts

## 🛡️ Security

- No external dependencies in production
- Content Security Policy headers
- Sanitized user inputs
- Secure localStorage handling
- Error boundaries prevent crashes

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📜 License

This project maintains the original license from Frank Lantz and Bennett Foddy.

## 🙏 Credits

- **Original Game**: Frank Lantz and Bennett Foddy
- **Modernization**: [Contributors](https://github.com/williamzujkowski/paperclips/graphs/contributors)
- **Original Source**: http://www.decisionproblem.com/paperclips/

## 📊 Debug Commands

The game includes debug tools accessible via the browser console:

```javascript
// State management
UniversalPaperclips.debug.getState();           // View full game state
UniversalPaperclips.debug.setState(path, value); // Modify state
UniversalPaperclips.debug.addClips(1000);       // Add clips
UniversalPaperclips.debug.addFunds(100);        // Add money
UniversalPaperclips.debug.unlockAll();          // Unlock all features

// Error & Performance
UniversalPaperclips.debug.getErrors();          // View error log
UniversalPaperclips.debug.getPerformance();    // View performance metrics
UniversalPaperclips.debug.setLogLevel('debug'); // Change log level

// Game control
UniversalPaperclips.debug.reset();              // Reset game (with confirmation)
```

## ⌨️ Keyboard Shortcuts

Press `?` in-game to see all available shortcuts:

- **Space** - Make paperclip
- **W** - Buy wire
- **A** - Buy auto-clipper
- **M** - Buy marketing
- **[** - Lower price
- **]** - Raise price
- **Q** - Quantum compute
- **Ctrl+S** - Save game
- **Ctrl+Shift+D** - Toggle dev dashboard
- **?** - Show keyboard shortcuts
- **Ctrl+Shift+S** - Open save slots manager

## 🎯 Roadmap

- [ ] Add achievements system
- [ ] Implement cloud saves
- [ ] Add keyboard shortcuts
- [ ] Create mobile-responsive design
- [ ] Add accessibility features
- [ ] Implement mod support

---

**Note**: This is a fan-made modernization. For the original game, visit http://www.decisionproblem.com/paperclips/