# Deployment Guide

## Current Status
All changes have been committed locally with the message:
- Commit hash: 05d6012
- Branch: master

## To Deploy Your Changes

### Option 1: Fork Original Repository
1. Go to https://github.com/jgmize/paperclips
2. Click "Fork" to create your own copy
3. Update the remote:
   ```bash
   git remote set-url origin git@github.com:williamzujkowski/paperclips.git
   git push -u origin master
   ```

### Option 2: Create New Repository
1. Go to GitHub and create a new repository named "paperclips"
2. Push your changes:
   ```bash
   git push -u origin master
   ```

## GitHub Actions Workflows

Once pushed, the following workflows will run:

### CI Workflow (.github/workflows/test.yml)
- Runs on push and pull requests
- Tests on Node.js 16.x, 18.x, and 20.x
- Runs linting, formatting checks, and tests
- Uploads coverage to Codecov

### Deploy Workflow (.github/workflows/deploy.yml)
- Runs on push to master
- Builds the project
- Deploys to GitHub Pages

## Known Issues to Fix

1. **Test Failures**: Some tests are failing due to localStorage mocking issues
   - Fix the mock setup in tests/setup.js
   - Update test expectations for formatting functions

2. **GitHub Pages Setup**: 
   - Enable GitHub Pages in repository settings
   - Set source to "Deploy from a branch" > "gh-pages"

3. **Build Output**: 
   - The build script creates files in docs/js/
   - Ensure GitHub Pages serves from the docs/ directory

## Local Testing

Before pushing:
```bash
# Run tests
npm test

# Check linting
npm run lint

# Check formatting
npm run format:check

# Build project
npm run build

# Test locally
npm run dev
```

## Post-Deploy Checklist

- [ ] Verify CI workflow passes
- [ ] Check GitHub Pages deployment
- [ ] Test the live game at https://williamzujkowski.github.io/paperclips/
- [ ] Update README with new development instructions
- [ ] Add badges for build status and test coverage