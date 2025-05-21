import fs from 'fs';
import path from 'path';

const srcDir = path.join(__dirname, '../src');
const extensions = ['.tsx', '.ts', '.jsx', '.js'];
const duplicates = new Set();
const unusedComponents = new Set();

// Function to check for duplicate files
const checkDuplicates = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      checkDuplicates(filePath);
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        const baseName = path.basename(file, ext);
        if (duplicates.has(baseName)) {
          console.log(`Duplicate file found: ${filePath}`);
        } else {
          duplicates.add(baseName);
        }
      }
    }
  });
};

// Function to check for unused components
const checkUnusedComponents = () => {
  // Logic to identify unused components
  // This can be implemented based on specific project needs
  // For example, checking imports in files and comparing with components in srcDir
};

// Run checks
checkDuplicates(srcDir);
checkUnusedComponents();