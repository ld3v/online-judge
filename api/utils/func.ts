import { Role } from "src/account/account.enum";
import { Account } from "src/account/entities/account.entity";
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * This func is used to convert array to map. Filter out items, which has key, or has not key.
 * @param {any[]} arr Array need to convert
 * @param {string} key Key of object
 * @param {boolean} withOrdering Add field 'ordering' to define order of item in the array. Default is `false`.
 * @returns {noKeyItems: any[]; hasKeyItems: any[]; keys: string[]; map: TMap} Result after convert.
 */
export const array2Map = <itemType=any>(arr: any[], key: string, withOrdering?: boolean): {
  noKeyItems: itemType[];
  hasKeyItems: itemType[];
  keys: string[];
  map: Record<string, itemType>;
} => {
  const res: Record<string, itemType> = {};
  const noKeyItems = arr.filter(arrItem => !arrItem[key]);
  const keyItems = arr.filter(arrItem => !!arrItem[key]);
  keyItems.forEach((item, idx) => {
    if (key === "key") {
      res[item[key]] = item.value;
      return;
    }
    if (item[key]) {
      res[item[key]] = item;
      if (withOrdering) { 
        res[item[key]]['ordering'] = idx + 1;
      }
      return;
    }

  });
  return {
    noKeyItems: noKeyItems,
    hasKeyItems: keyItems,
    keys: Object.keys(res),
    map: res,
  };
}

export const ifViewByAdmin = (requester: Account) => (value: any) => requester.role === Role.Admin ? value : undefined;
export const isAdmin = (requester: Account, adminValues: any, nonAdminValues: any) => requester.role === Role.Admin ? adminValues : nonAdminValues;

/**
 * Delay
 * @param {number} ms Delay in {ms} milliseconds. Default is 5s.
 * @returns {any}
 */
export const sleep = (ms: number = 5000): Promise<any> => new Promise(resolve => setTimeout(resolve, ms));

export const reserveMapping = (mapping: Record<string | number, (string | number)[]>): Record<string | number, (string | number)[]> => {
  const mappingReserved: Record<string | number, (string | number)[]> = {};
  Object.keys(mapping).forEach((mapKey: number | string) => {
    const mapValues = mapping[mapKey];
    mapValues.forEach(mapValueKey => {
      if (mappingReserved[mapValueKey]) {
        mappingReserved[mapValueKey] = [...new Set([...mappingReserved[mapValueKey], mapKey])];
        return;
      }
      mappingReserved[mapValueKey] = [mapKey];
    });
  });
  return mappingReserved;
}


export const isObj = (inp: any): boolean => {
  return typeof inp === "object" && !Array.isArray(inp);
}
export const jsonParsed = (str: string): false | string => {
  try {
    const res = JSON.parse(str);
    return res;
  } catch (e) {
    return false;
  }
}
export const isArrNumbers = (arr: any[], length?: number): boolean => {
  const isArrNum = (
    Array.isArray(arr) &&
    !arr.find(arrItem => typeof arrItem !== "number" || isNaN(arrItem))
  );
  if (length !== undefined) {
    return isArrNum && arr.length === length;
  }
  return isArrNum
}
export const cleanDir = async (dirPath: string) => {
  try {
    const files = await fs.readdir(dirPath);
    return await Promise.all(files.map(async file => {
      try {
        const pathStat = await fs.lstat(path.join(dirPath, file));
        if (pathStat.isDirectory()) {
          return await cleanDir(path.join(dirPath, file));
        }
        await fs.unlink(path.join(dirPath, file));
        return true;
      } catch (err) {
        console.error('Error when remove: ', dirPath, file);
        return false;
      }
    }));
  } catch (err) {
    throw err;
  }
}

/**
 * Remove all of files old (Not be override by this upload).
 * 
 * This action should be call to remove files inside `upload` folder.
 * @param {string} dirPath Your path should be start with `./`. Ex: `./upload/abc/xyz`.
 * @param {Express.Multer.File[]} files List files just uploaded.
 */
export const rmDiffFiles = async (dirPath: string, files: Express.Multer.File[]) => {
  const dirFiles = await fs.readdir(dirPath);
  const filePaths = files.map(f => f.path);
  const promiseRemoveFilesIfNotDuplicate = dirFiles.map(async f => {
    const fPath = path.join(dirPath, f);
    try {
      const pathStat = await fs.lstat(fPath);
      if (pathStat.isFile()) {
        // Remove file if not exist in `files` | Else return `""`
        if (filePaths.includes(fPath)) {
          return `${fPath}|NONE`;
        }
        await fs.unlink(fPath);
        return `${fPath}|DONE`;
      }
      return await rmDiffFiles(fPath, files);
    } catch (err) {
      console.error('[rmDiffFiles] - Error when read file by path:', err);
      return `${fPath}|ERR`;
    }
  });
  return await Promise.all(promiseRemoveFilesIfNotDuplicate);
}

/**
 * 
 * @param {string} dirPath Dir path need to read.
 * @param {string} parentPath **NOT USE THIS FIELD** This field will be used to re-call by this function. 
 */
export const getFileInDir = async (dirPath: string, parentPath: string = '') => {
  const dirContent = await fs.readdir(dirPath);
  
  const promiseFiles = dirContent.map(async f => {
    const fPath = path.join(dirPath, f);
    try {
      const pathStat = await fs.lstat(fPath);
      if (pathStat.isFile()) {
        return {
          name: f,
          file: {
            webkitRelativePath: path.join(parentPath, f),
          },
          key: `file_${f}`,
          isViewOnly: true,
        };
      }
      return await getFileInDir(fPath, path.join(parentPath, f));
    } catch (err) {
      console.error('[rmDiffFiles] - Error when read file by path:', err);
      return { err };
    }
  });

  return (await Promise.all(promiseFiles)).flat();
}