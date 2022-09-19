import { Select } from 'antd';
import React, { useEffect, useState } from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';

import languages, { TCodeEditorLang } from './language';
import themes from './themes';
import styles from './styles.less';
import { mapLang } from './utils';
import { connect } from 'umi';

// Load initial modes & themes
languages.forEach((lang) => {
  import(`ace-builds/src-noconflict/mode-${lang}`);
  import(`ace-builds/src-noconflict/snippets/${lang}`);
});
themes.forEach((theme) => import(`ace-builds/src-noconflict/theme-${theme}`));

export interface ICodeEditor extends IAceEditorProps {
  languageAvailable?: TCodeEditorLang[];
  langs?: any[];
  dispatch?: any;
}

const themeDefault = themes[0];
const themeOptions = themes.map((theme) => ({ value: theme, label: theme }));

const CodeEditor: React.FC<ICodeEditor> = ({
  onChange,
  value,
  languageAvailable,
  langs,
  dispatch,
  ...editorProps
}) => {
  const langExt = (langs || []).map((l) => l.ext);
  const langExtAvailable = languageAvailable || langExt || [];

  const [codeLang, setLang] = useState<string>(
    langExtAvailable.length > 0 ? langExtAvailable[0] : '',
  );
  const [codeTheme, setTheme] = useState<string>(themeDefault);

  useEffect(() => {
    dispatch({ type: 'language/get' });
  }, []);

  // Language options
  const langOptions = (langs || [])
    .filter((l: any) => langExtAvailable.includes(l.ext))
    .map((l) => ({ value: l.ext, label: l.name }));

  return (
    <div className={styles.CodeEditor}>
      <div className={styles.Header}>
        <Select options={langOptions} onChange={(v) => setLang(v)} value={codeLang} />
        <Select options={themeOptions} onChange={(v) => setTheme(v)} value={codeTheme} />
      </div>
      <div className={styles.Editor}>
        <AceEditor
          mode={mapLang[codeLang]}
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
