import fs from 'fs';
import path from 'path';

const targetExtensions = ['.tsx', '.ts', '.jsx', '.js'];
const excludedDirectories = ['node_modules', 'dist', 'build'];

function isExcludedDirectory(dir) {
    return excludedDirectories.includes(dir);
}

function collectFiles(dir) {
    let files: string[] = [];

    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!isExcludedDirectory(file)) {
                files = files.concat(collectFiles(fullPath));
            }
        } else if (targetExtensions.includes(path.extname(file))) {
            files.push(fullPath);
        }
    });

    return files;
}

function deleteFile(filePath) {
    fs.unlinkSync(filePath);
    console.log(`Deleted: ${filePath}`);
}

function cleanupUnusedFiles() {
    const projectRoot = path.resolve(__dirname, '../..');
    const collectedFiles = collectFiles(projectRoot);

    // Here you can implement logic to determine which files are unused
    // For demonstration, we will just log the collected files
    console.log('Collected Files:', collectedFiles);

    // Uncomment the following lines to delete files
    // collectedFiles.forEach(file => {
    //     if (/* condition to check if file is unused */) {
    //         deleteFile(file);
    //     }
    // });
}

cleanupUnusedFiles();