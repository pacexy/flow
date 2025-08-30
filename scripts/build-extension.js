const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const browser = process.argv[2];
if (!browser || (browser !== 'chrome' && browser !== 'firefox')) {
  console.error('Error: Browser name (chrome or firefox) is required as an argument.');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');
const extensionDir = path.join(rootDir, 'apps', 'extension');
const readerDir = path.join(rootDir, 'apps', 'reader');
const distDir = path.join(extensionDir, 'dist');
const outDir = path.join(readerDir, 'out');
const iconsDir = path.join(readerDir, 'public', 'icons');
const manifestsDir = path.join(extensionDir, 'manifests');

async function build() {
  try {
    // 1. Clean the dist directory
    console.log(`Cleaning ${distDir}...`);
    await fs.remove(distDir);

    // 2. Run the static export
    console.log('Building the reader app for static export...');
    execSync('pnpm --filter @flow/reader build:export', { stdio: 'inherit', cwd: rootDir });

    // 3. Create the dist directory
    await fs.ensureDir(distDir);

    // 4. Copy static files from `out` to `dist`
    console.log(`Copying files from ${outDir} to ${distDir}...`);
    await fs.copy(outDir, distDir);

    // 5. Copy icons
    console.log(`Copying icons from ${iconsDir}...`);
    await fs.copy(iconsDir, path.join(distDir, 'icons'));

    // 6. Copy the manifest
    console.log(`Copying manifest for ${browser}...`);
    const manifestFile = browser === 'chrome'
      ? 'chrome_manifest_v3.json'
      : 'firefox_manifest_v2.json';
    await fs.copy(
      path.join(manifestsDir, manifestFile),
      path.join(distDir, 'manifest.json')
    );

    // 7. Copy background script
    console.log('Copying background script...');
    await fs.copy(
      path.join(extensionDir, 'public', 'background.js'),
      path.join(distDir, 'background.js')
    );

    // 8. Delete problematic files for Chrome
    if (browser === 'chrome') {
      console.log('Deleting files reserved by Chrome...');
      await fs.remove(path.join(distDir, '_.html'));
    }

    console.log(`\n✅ Extension for ${browser} built successfully!`);
    console.log(`✅ Output directory: ${distDir}`);

  } catch (error) {
    console.error('\n❌ Error building the extension:', error);
    process.exit(1);
  }
}

build();
