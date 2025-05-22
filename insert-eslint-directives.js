#!/usr/bin/env node
/**
 * insert-eslint-directives.js
 * Usage: node insert-eslint-directives.js [mappingFile]
 *
 * Reads a JSON mapping of file paths to ESLint directives and inserts the directive at the top of each file if not already present.
 *
 * Example mapping file (eslint-directives-map.json):
 * {
 *   "scripts/firestore_patch_user_names.js": "/* eslint-env node */",
 *   "mongo-init.js": "/* global db, print */"
 * }
 */
const fs = require('fs');
const path = require('path');

const mappingFile = process.argv[2] || 'eslint-directives-map.json';
const projectRoot = process.cwd();

function hasDirective(content, directive) {
  // Check if the directive is in the first 5 lines
  return content.split('\n').slice(0, 5).some(line => line.includes(directive.replace('/*', '').replace('*/', '').trim()));
}

function insertDirective(filePath, directive) {
  const absPath = path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);
  if (!fs.existsSync(absPath)) {
    console.warn(`[WARN] File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(absPath, 'utf8');
  if (hasDirective(content, directive)) {
    // Already present
    return;
  }
  // Preserve shebang if present
  let shebang = '';
  if (content.startsWith('#!')) {
    const idx = content.indexOf('\n');
    shebang = content.slice(0, idx + 1);
    content = content.slice(idx + 1);
  }
  content = content.replace(/^(\/\* eslint-env [^*]*\*\/\s*)+/gm, ''); // Remove all eslint-env directives
  const newContent = shebang + directive + '\n' + content;
  fs.writeFileSync(absPath, newContent, 'utf8');
  console.log(`[MODIFIED] ${filePath}`);
}

function main() {
  if (!fs.existsSync(mappingFile)) {
    console.error(`[ERROR] Mapping file not found: ${mappingFile}`);
    process.exit(1);
  }
  const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
  Object.entries(mapping).forEach(([file, directive]) => {
    insertDirective(file, directive);
  });
  console.log('\n✅ ESLint directives inserted where needed.');
}

main();
