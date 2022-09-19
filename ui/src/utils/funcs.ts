import { TMap } from '@/types';

/**
 * This func is used to convert array to map. Filter out items, which has key, or has not key.
 * @param {any[]} arr Array need to convert
 * @param {string} key Key of object
 * @returns {noKeyItems: any[]; hasKeyItems: any[]; keys: string[]; map: TMap} Result after convert.
 */
export const array2Map = (
  arr: any[],
  key: string,
): {
  noKeyItems: any[];
  hasKeyItems: any[];
  keys: string[];
  map: TMap;
} => {
  const res: TMap = {};
  const noKeyItems = (arr || []).filter((arrItem) => !arrItem[key]);
  const keyItems = (arr || []).filter((arrItem) => !!arrItem[key]);
  keyItems.forEach((item) => {
    if (key === "key") {
      res[item.key] = item.value;
      return;
    }
    if (item[key]) {
      res[item[key]] = item;
      return;
    }
  });
  return {
    noKeyItems: noKeyItems,
    hasKeyItems: keyItems,
    keys: Object.keys(res),
    map: res,
  };
};

export const sumNums = (...arr: number[]): number => {
  const current = arr[0] || 0;
  arr.shift();
  return arr.length > 0
    ? Number(current) + sumNums(...arr)
    : Number(current);
}

export const sumItems = (key: string, ...items: any[]) => {
  const keyValues = items.map(item => item[key] || 0);
  return sumNums(...keyValues);
}