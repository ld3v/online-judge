import { Select } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';

import languages, { TCodeEditorLang } from './language';
import themes from './themes';
import styles from './styles.less';
import { codeEditorLang2langExt, langExt2CodeEditorLang } from './utils';
import { connect } from 'umi';

// Load initial modes & themes
languages.forEach((lang) => {
  import(`ace-builds/src-noconflict/mode-${lang}`);
  import(`ace-builds/src-noconflict/snippets/${lang}`);
});
const languageExtSupported: string[] = languages.map((l) => codeEditorLang2langExt[l]).flat();

themes.forEach((theme) => import(`ace-builds/src-noconflict/theme-${theme}`));
import('ace-builds/src-noconflict/ext-searchbox');
import('ace-builds/src-noconflict/ext-language_tools');
import('ace-builds/webpack-resolver');

export interface ICodeEditor extends IAceEditorProps {
  languageExtensionAvailable?: TCodeEditorLang[];
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
  languageExtensionAvailable,
  langs,
  dispatch,
  ...editorProps
}) => {
  // langExtAvailable = "langExtSupported" JOIN (langExtensionAvailable from user | langExt from db)
  const langExtAvailable = useMemo(() => {
    const langExt = (langs || []).map((l) => l.ext);
    const langExtensionAvailable = languageExtensionAvailable || langExt || [];
    return langExtensionAvailable.length > 0
      ? languageExtSupported.filter((ext) => langExtensionAvailable.includes(ext))
      : languageExtSupported;
  }, [langs, languageExtensionAvailable]);

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

export default connect(({ language }: any) => {
  const langs = Object.values(language.dic);

  return {
    langs: langs.map((l: any) => ({ name: l.name, ext: l.extension })),
  };
})(CodeEditor);
