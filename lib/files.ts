/*
Here, we need to:
  1. get the current directory (to get a default repo name)
  2. check whether a directory exists (to determine whether the current folder is already a Git repository by looking for a folder named .git).
*/
import fs from 'fs';
import path from 'path';

export const getCurrentDirectoryBase = () => path.basename(process.cwd());

export const directoryExists = (filePath: string) => {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (error) {
    return false;
  }
};
