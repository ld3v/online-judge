import { Select } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';

import languages, { TCodeEditorLang, TLanguageExt } from './language';
import themes from './themes';
import styles from './styles.less';
import { codeEditorLang2langExt, langExt2CodeEditorLang } from './utils';
import { connect } from 'umi';

// Load initial modes & themes
languages.forEach((lang) => {
  import(`ace-builds/src-noconflict/mode-${lang}`);
  import(`ace-builds/src-noconflict/snippets/${lang}`);
});
const languageExtSupported: TLanguageExt[] = languages.map((l) => codeEditorLang2langExt[l]).flat();

themes.forEach((theme) => import(`ace-builds/src-noconflict/theme-${theme}`));
import('ace-builds/src-noconflict/ext-searchbox');
import('ace-builds/src-noconflict/ext-language_tools');
import('ace-builds/webpack-resolver');

export interface ICodeEditor extends IAceEditorProps {
  onChangeLang?: (newLang: TCodeEditorLang) => void;
  langs?: { ext: string; name: string }[];
  dispatch?: any;
}

const themeDefault = themes[0];
const themeOptions = themes.map((theme) => ({ value: theme, label: theme }));

const CodeEditor: React.FC<ICodeEditor> = ({
  onChange,
  onChangeLang,
  value,
  langs,
  dispatch,
  ...editorProps
}) => {
  const langExtAvailable = useMemo(() => {
    const langExt = (langs || []).map((l) => l.ext);
    const langExtensionAvailable = langExt || undefined;
    console.log(languageExtSupported, langExtensionAvailable);
    return langExtensionAvailable.length > 0
      ? languageExtSupported.filter((ext) => langExtensionAvailable.includes(ext))
      : languageExtSupported;
  }, [langs]);

  const [codeLang, setLang] = useState<TCodeEditorLang | undefined>(undefined);
  const [codeTheme, setTheme] = useState<string>(themeDefault);

  const handleChangeLang = (codeLang: TCodeEditorLang) => {
    setLang(codeLang);
    onChangeLang?.(codeLang);
  };

  useEffect(() => {
    const setLangCb = (langs: any) => {
      if (Array.isArray(langs) && langs.length > 0) {
        const langsSupported = langs.filter((l) => langExtAvailable.includes(l.extension));
        handleChangeLang(langsSupported[0].extension);
      }
    };
    dispatch({ type: 'language/get', payload: { callback: setLangCb } });
  }, []);

  // Language options
  const langOptions = (langs || [])
    .filter((l: any) => langExtAvailable.includes(l.ext))
    .map((l) => ({ value: l.ext, label: l.name }));

  return (
    <div className={styles.CodeEditor}>
      <div className={styles.Header}>
        <Select<TCodeEditorLang>
          options={langOptions}
          onChange={(v: TCodeEditorLang) => handleChangeLang(v)}
          value={codeLang}
        />
        <Select options={themeOptions} onChange={(v) => setTheme(v)} value={codeTheme} />
      </div>
      <div className={styles.Editor}>
        <AceEditor
          mode={codeLang ? langExt2CodeEditorLang[codeLang] : undefined}
          theme={codeTheme}
          onChange={onChange}
          name="ACE_CODE_EDITOR"
          width="100%"
          height="400px"
          editorProps={{ $blockScrolling: true }}
          value={value}
          {...editorProps}
        />
      </div>
    </div>
  );
};

export default connect(({ language, assignments }: any, { problemId }: any) => {
  const langs = Object.values(language.dic);
  const { langExtAvailable } = assignments.problemDic[problemId] || {};
  return {
    langs: langExtAvailable
      ? langs
          .filter((l: any) => langExtAvailable.includes(l.extension))
          .map((l: any) => ({ name: l.name, ext: l.extension }))
      : [],
  };
})(CodeEditor);
