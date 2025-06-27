#!/usr/bin/env node
/**
 * Version management script
 * Handles version bumping and git tagging
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const versionType = args[1] || 'patch'; // major, minor, patch

// Paths
const packagePath = path.join(__dirname, '..', 'package.json');
const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  console.error(`${colors.red}❌ ${message}${colors.reset}`);
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function getCurrentVersion() {
  return package.version;
}

function bumpVersion(current, type) {
  const parts = current.split('.').map(Number);
  
  switch (type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
      parts[2]++;
      break;
    default:
      error(`Invalid version type: ${type}. Use major, minor, or patch.`);
  }
  
  return parts.join('.');
}

function updatePackageJson(newVersion) {
  package.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(package, null, 2) + '\n');
  success(`Updated package.json to version ${newVersion}`);
}

function gitCommit(version) {
  try {
    execSync('git add package.json', { stdio: 'inherit' });
    execSync(`git commit -m "chore: bump version to ${version}"`, { stdio: 'inherit' });
    success(`Committed version bump`);
  } catch (err) {
    error(`Failed to commit: ${err.message}`);
  }
}

function gitTag(version) {
  const tagName = `v${version}`;
  const tagMessage = `Release version ${version}`;
  
  try {
    execSync(`git tag -a ${tagName} -m "${tagMessage}"`, { stdio: 'inherit' });
    success(`Created tag ${tagName}`);
  } catch (err) {
    error(`Failed to create tag: ${err.message}`);
  }
}

function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain').toString();
    if (status && !status.includes('package.json')) {
      error('Git working directory is not clean. Please commit or stash changes.');
    }
  } catch (err) {
    error(`Failed to check git status: ${err.message}`);
  }
}

function listTags() {
  try {
    const tags = execSync('git tag -l "v*" --sort=-version:refname').toString().trim();
    if (tags) {
      info('Existing version tags:');
      console.log(tags);
    } else {
      info('No version tags found');
    }
  } catch (err) {
    error(`Failed to list tags: ${err.message}`);
  }
}

function showHelp() {
  console.log(`
${colors.bright}Universal Paperclips Version Management${colors.reset}

Usage:
  npm run version:bump [major|minor|patch]  - Bump version and create tag
  npm run version:list                      - List all version tags
  npm run version:current                   - Show current version

Examples:
  npm run version:bump patch               - 2.0.0 → 2.0.1
  npm run version:bump minor               - 2.0.0 → 2.1.0
  npm run version:bump major               - 2.0.0 → 3.0.0

Current version: ${getCurrentVersion()}
`);
}

// Main command handling
switch (command) {
  case 'bump':
    checkGitStatus();
    const currentVersion = getCurrentVersion();
    const newVersion = bumpVersion(currentVersion, versionType);
    
    info(`Bumping version from ${currentVersion} to ${newVersion}`);
    
    updatePackageJson(newVersion);
    gitCommit(newVersion);
    gitTag(newVersion);
    
    console.log('');
    success(`Version ${newVersion} released!`);
    info(`To push: git push && git push origin v${newVersion}`);
    break;
    
  case 'list':
    listTags();
    break;
    
  case 'current':
    info(`Current version: ${getCurrentVersion()}`);
    break;
    
  case 'help':
  default:
    showHelp();
    break;
}