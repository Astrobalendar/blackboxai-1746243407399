// utils.ts
import fs from 'fs';
import path from 'path';

export const log = (message: string): void => {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
};

export const readDirectory = (dir: string): string[] => {
    return fs.readdirSync(dir).map(file => path.join(dir, file));
};

export const isFile = (filePath: string): boolean => {
    return fs.statSync(filePath).isFile();
};

export const isDirectory = (filePath: string): boolean => {
    return fs.statSync(filePath).isDirectory();
};

export const deleteFile = (filePath: string): void => {
    fs.unlinkSync(filePath);
    log(`Deleted file: ${filePath}`);
};