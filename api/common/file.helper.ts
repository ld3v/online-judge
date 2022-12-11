import * as fs from 'fs';
import { promisify } from 'util';

/**
 * Check if a file exists at a given path.
 */
export const isExist = (path: string): boolean => {
  return fs.existsSync(path);
};

/**
 * Check if Directory with given path
 */
export const isDir = (path: string): boolean => {
  return fs.lstatSync(path).isDirectory();
}

/**
 * Check if File with given path
 */
export const isFile = (path: string): boolean => {
  return fs.lstatSync(path).isFile();
}

/**
 * Gets file data from a given path via a promise interface.
 */
export const getFileContent = async (
  path: string,
  encoding?: any,
  showErrIfErr: boolean = true,
): Promise<string> => {
  if (!isFile(path)) {
    if (showErrIfErr) {
      throw new Error('file.invalid');
    }
    return "";
  }

  const readFile = promisify(fs.readFile);
  const content = await readFile(path, encoding || {});
  return content.toString();
};

/**
 * Writes a file at a given path via a promise interface.
 * 
 * In the case that file existed, it will be overwrite.
 */
export const addFile = async (
  dirPath: string,
  fileName: string,
  data: string,
): Promise<void> => {
  addDir(dirPath);

  const writeFile = promisify(fs.writeFile);
  return await writeFile(`${dirPath}/${fileName}`, data, 'utf8');
};

export const addDir = async (
  dirPath: string,
): Promise<void> => {
  if (!isExist(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Delete file at the given path via a promise interface
 */
export const deleteFile = async (path: string): Promise<void> => {
  if (!isExist(path) || !isFile(path)) {
    throw new Error('file.invalid');
  }

  const unlink = promisify(fs.unlink);
  return await unlink(path);
};