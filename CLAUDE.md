# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Universal Paperclips, a browser-based incremental game by Frank Lantz and Bennett Foddy. The repository is a mirror of the original game from decisionproblem.com with some modifications:
- Google Analytics removed
- Cheats uncommented
- Files moved to `docs/` folder for GitHub Pages hosting

## Architecture

The game is built with vanilla JavaScript, HTML, and CSS - no build tools or frameworks:

- **docs/index.html** - Title screen that links to the game
- **docs/index2.html** - Main game interface
- **docs/main.js** (5,546 lines) - Core game logic and state management
- **docs/projects.js** (2,452 lines) - Game projects/upgrades system
- **docs/combat.js** (802 lines) - Space combat mechanics
- **docs/globals.js** (182 lines) - Global variable declarations
- **docs/interface.css** - Main game styling
- **docs/titlescreen.css** - Title screen styling

The game follows an incremental/idle game pattern where players progress through phases:
1. Manual paperclip production
2. Automated production with auto-clippers
3. Resource management and optimization
4. Advanced projects and strategic decisions
5. Space exploration and combat

## Development Commands

```bash
# Run local development server (serves from docs/ folder)
./serve.sh
# Access game at http://localhost:8000/index2.html

# Mirror latest version from original source
./mirror.sh
```

Note: The serve.sh script has an outdated path (cd src) - it should cd to docs/ instead.

## Key Implementation Details

- All game state is managed through global variables declared in globals.js
- The main game loop and UI updates are handled in main.js
- Projects (upgrades/abilities) are defined in projects.js with cost, effect, and unlock conditions
- Combat system in combat.js handles probe battles in space exploration phase
- No external dependencies - uses only browser APIs
- Cheats are available through browser console (previously commented out, now active)

## GitHub Pages Deployment

The game is deployed via GitHub Pages from the `docs/` folder on the master branch. Any changes to files in `docs/` will be reflected on the live site after pushing to GitHub.