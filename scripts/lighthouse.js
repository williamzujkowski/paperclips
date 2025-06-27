#!/usr/bin/env node
/**
 * Lighthouse audit script
 * Runs performance audits on the game
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const urls = [
  'http://localhost:8000/',
  'http://localhost:8000/index2.html',
  'http://localhost:8000/index_modern.html',
];

const outputDir = path.join(__dirname, '..', 'lighthouse-reports');

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
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

info('Starting Lighthouse audits...');
info('Make sure the development server is running (npm run dev)');
console.log('');

// Check if lighthouse is installed
try {
  execSync('npx lighthouse --version', { stdio: 'ignore' });
} catch (err) {
  error('Lighthouse is not installed. Installing...');
  execSync('npm install -D lighthouse', { stdio: 'inherit' });
}

// Run audits
urls.forEach((url, index) => {
  const pageName = url.includes('index2') ? 'legacy' : 
                   url.includes('modern') ? 'modern' : 'landing';
  const outputPath = path.join(outputDir, `${pageName}-report.html`);
  
  info(`Auditing ${pageName} page: ${url}`);
  
  try {
    // Run Lighthouse
    const cmd = `npx lighthouse ${url} ` +
      `--output=html ` +
      `--output-path="${outputPath}" ` +
      `--chrome-flags="--headless" ` +
      `--only-categories=performance,accessibility,best-practices,seo ` +
      `--quiet`;
    
    const result = execSync(cmd, { encoding: 'utf8' });
    
    // Extract scores from output
    const scoreMatch = result.match(/Performance:\s+(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 'Unknown';
    
    if (score >= 90) {
      success(`${pageName}: Performance score ${score}/100`);
    } else if (score >= 50) {
      log(`⚠️  ${pageName}: Performance score ${score}/100`, colors.yellow);
    } else {
      log(`❌ ${pageName}: Performance score ${score}/100`, colors.red);
    }
    
    info(`Report saved to: ${outputPath}`);
  } catch (err) {
    error(`Failed to audit ${url}: ${err.message}`);
  }
  
  console.log('');
});

// Summary
console.log('');
success('Lighthouse audits complete!');
info(`Reports saved in: ${outputDir}`);
info('Open the HTML reports in your browser to see detailed results.');

// Recommendations
console.log('');
log('Common optimization opportunities:', colors.bright);
console.log('- Enable text compression (gzip/brotli)');
console.log('- Add resource hints (preload, prefetch)');
console.log('- Optimize images (WebP format, lazy loading)');
console.log('- Minimize main thread work');
console.log('- Reduce JavaScript execution time');
console.log('- Implement service worker for offline support');