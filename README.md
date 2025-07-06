# Universal Paperclips

A modernized version of the classic incremental game Universal Paperclips by Frank Lantz and Bennett Foddy.

**Play the game:** https://williamzujkowski.github.io/paperclips/

## Overview

This repository contains a fully modernized version of Universal Paperclips that maintains the original gameplay while upgrading the codebase with:

- ES6 modules and modern JavaScript
- Comprehensive test suite (525+ tests)
- CI/CD pipeline with GitHub Actions
- Error handling and performance monitoring
- Save/load system with import/export

## Quick Start

```bash
# Clone the repository
git clone https://github.com/williamzujkowski/paperclips.git
cd paperclips

# Install dependencies
npm install

# Start development server
npm run dev
# Opens http://localhost:8080 automatically
```

## Development

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

## Project Structure

```
paperclips/
├── src/                # Modern source code
├── tests/              # Test suite
├── docs/               # GitHub Pages deployment
├── scripts/            # Build and dev scripts
└── .github/            # CI/CD workflows
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Documentation

For detailed development documentation, see [CLAUDE.md](./CLAUDE.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- **Original Game**: Frank Lantz and Bennett Foddy
- **Modernization**: William Zujkowski
- **Original Game URL**: http://www.decisionproblem.com/paperclips/
