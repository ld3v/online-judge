import { TFileDisplay } from '@/components/InputUpload/FilesDisplay';
import { TMap } from '@/types';
import { UploadFile } from 'antd/es/upload';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

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

/**
 * Convert data to FormData
 * @param {Object} data Data need to convert
 * @param {string} parentField Wrap field
 * @param {FormData} formData Current FormData
 * @returns {FormData}
 */
export const JSON2FormData = (data: Record<string, any>, parentField?: string, formData?: FormData): undefined | FormData => {
  if (!(data instanceof Object)) {
    // Handle error here
    if (!parentField) {
      // Only show error if when running first times
      console.error('[JSON2FormData] - Invalid object data to convert');
    }
    return formData;
  }
  const dataFields = Object.keys(data);
  if (dataFields.length === 0) {
    // Handle error here
    if (!parentField) {
      // Only show error if when running first times
      console.error('[JSON2FormData] - No fields to add to FormData');
    }
    return formData;
  }
  const form = formData || new FormData();
  dataFields.forEach((dataField) => {
    const currentField = parentField ? `${parentField}[${dataField}]` : dataField;
    const dataByField = data[dataField];
    // In cases Array, Object, ... (instance of Object) except File (or File[]).
    if (
      dataByField instanceof Object &&
      (
        (!Array.isArray(dataByField) && !(dataByField instanceof File)) ||
        (Array.isArray(dataByField) && !(dataByField[0] instanceof File))
      )
    ) {
      JSON2FormData(dataByField, currentField, form);
      return form;
    }
    if (Array.isArray(dataByField) && (dataByField[0] instanceof File)) {
      dataByField.forEach(file => {
        form.append(currentField, file);
      });
      return form;
    }
    // Other, string, number and File (or File[]).
    form.append(currentField, dataByField);
    return form;
  });
  return form;
};

export const sumItems = (key: string, ...items: any[]) => {
  const keyValues = items.map(item => item[key] || 0);
  return sumNums(...keyValues);
}

/**
 * This func is used to convert UploadFile (use component `Upload` in antd lib) to File
 * @param {UploadFile[]} files Files need to convert 
 * @returns {RcFile[]} File list
 */
export const getOriginFiles = (files: UploadFile[] = []): File[] => {
  return files
    .map(f => f && f.originFileObj && f.originFileObj instanceof File ? f.originFileObj : undefined)
    .filter(f => f) as File[];
}

// Support validation
export const isNotZero = (inp?: Number) => !!inp && inp !== 0;

export type FileStructure = { [name: string]: FileStructure | string };
export const getFileStructure = (files: TFileDisplay[], skipRoot: boolean = true): FileStructure => {
  const structure: FileStructure = {};
  files.forEach((fileItem) => {
    const [_, ...parentFolder] = fileItem.file.webkitRelativePath.split('/'); // Skip root
    const pathFilename = parentFolder.pop(); // Remove last item (file) -> Get parent folder
    let parentFolderLength = parentFolder.length;
    let parent = structure;

    // Add nested folder to structure
    for (let i = 0; i < parentFolderLength; i += 1) {
      parent = structure;
      if (!parent[parentFolder[i]]) {
        parent[parentFolder[i]] = {};
      }
    }

    if (pathFilename) {
      if (parentFolderLength > 0) {
        parent[parentFolder[parentFolderLength - 1]][pathFilename] = fileItem.name;
      } else {
        structure[pathFilename] = fileItem.name;
      }
    }
  });
  return structure;
}

export const validateTestCasesFolder = (files: TFileDisplay[]): { msg: string, variables?: Record<string, string | number> } | undefined => {
  const filenames = files.map(f => f.name);
  const inputFilenames = filenames.filter(filename => /input\d{1,3}\.txt/gm.test(filename));
  const outputFilenames = filenames.filter(filename => /output\d{1,3}\.txt/gm.test(filename));
  if ((filenames.length - inputFilenames.length - outputFilenames.length - (filenames.includes('template.cpp') ? 1 : 0)) > 0) {
    return { msg: 'exception.problem.solution-checking.includes-other-files' };
  }
  if (inputFilenames.length !== outputFilenames.length) {
    return {
      msg: 'exception.problem.solution-checking.input-diff-output',
      variables: {
        inpCount: inputFilenames.length,
        outCount: outputFilenames.length,
      },
    };
  }
  // Check duplicate filename
  const inputFilenamesNoDup = [...new Set([...inputFilenames])];
  const outputFilenamesNoDup = [...new Set([...outputFilenames])];
  if (inputFilenamesNoDup.length < inputFilenames.length || outputFilenamesNoDup.length < outputFilenames.length) {
    return { msg: 'exception.problem.solution-checking.duplicated-filenames' };
  }
  return undefined;
}

export const getMDContent = (src: string, options?: marked.MarkedOptions) => {
  try {
    const markedParsed = marked(src, options);
    const markedHTML = DOMPurify.sanitize(markedParsed);
    return markedHTML;
  } catch (err) {
    console.error('[ERROR] - [GET-MD-CONTENT]:', err);
    return '';
  }
}