#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building Universal Paperclips...\n');

// Ensure build directories exist
const docsJsDir = path.join(__dirname, '../docs/js');
if (!fs.existsSync(docsJsDir)) {
  fs.mkdirSync(docsJsDir, { recursive: true });
}

// Run rollup build
try {
  console.log('📦 Bundling JavaScript modules...');
  execSync('npx rollup -c', { stdio: 'inherit' });
  console.log('✅ JavaScript bundled successfully\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Copy static assets if needed
console.log('📋 Copying static assets...');

// Create a modern index.html if it doesn't exist
const modernIndexPath = path.join(__dirname, '../docs/index_modern.html');
const modernIndexContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Universal Paperclips</title>
    <link rel="stylesheet" href="interface.css">
    <link rel="stylesheet" href="titlescreen.css">
</head>
<body>
    <div id="game-container">
        <div id="mainDisplay"></div>
        <div id="businessDisplay"></div>
        <div id="manufacturingDisplay"></div>
        <div id="computationalDisplay"></div>
        <div id="projectsDisplay"></div>
        <div id="spaceDisplay"></div>
        <div id="endScreen"></div>
    </div>
    
    <!-- Modern bundled version -->
    <script src="js/game.min.js"></script>
    
    <!-- Legacy scripts (commented out - use only if modern version fails) -->
    <!-- 
    <script src="globals.js"></script>
    <script src="main.js"></script>
    <script src="projects.js"></script>
    <script src="combat.js"></script>
    -->
</body>
</html>`;

if (!fs.existsSync(modernIndexPath)) {
  fs.writeFileSync(modernIndexPath, modernIndexContent);
  console.log('✅ Created modern index HTML\n');
}

// Build info
const buildInfo = {
  version: require('../package.json').version,
  buildTime: new Date().toISOString(),
  commit: getGitCommit(),
};

fs.writeFileSync(
  path.join(docsJsDir, 'build-info.json'),
  JSON.stringify(buildInfo, null, 2)
);

console.log('✅ Build complete!\n');
console.log('📊 Build Info:');
console.log(`   Version: ${buildInfo.version}`);
console.log(`   Time: ${buildInfo.buildTime}`);
console.log(`   Commit: ${buildInfo.commit}\n`);
console.log('🚀 Ready to deploy to GitHub Pages!');

function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}