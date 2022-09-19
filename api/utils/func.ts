import { Role } from "src/account/account.enum";
import { Account } from "src/account/entities/account.entity";

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