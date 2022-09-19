import { TCodeEditorLang } from "./language";

/**
 * ### [IMPORTANT]
 * This object was created to convert the language's extension -> key, which was used to render CodeEditor's mode.
 * 
 * -> Please update this object when you change the language's extension in the database.
 */
export const mapLang: Record<string, TCodeEditorLang> = {
  c: 'c_cpp',
  cpp: 'c_cpp',
  java: 'java',
  py2: 'python',
  py3: 'python',
  pas: 'pascal',
  numpy: 'python',
};