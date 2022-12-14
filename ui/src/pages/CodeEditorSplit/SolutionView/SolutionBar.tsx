import languages, { TCodeEditorLang, TLanguageExt } from '@/components/Code/CodeEditor/language';
import { codeEditorLang2langExt } from '@/components/Code/CodeEditor/utils';
import { LoadingOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { useEffect, useMemo } from 'react';
import { connect, FormattedMessage } from 'umi';
import styles from './styles.less';

const languageExtSupported: TLanguageExt[] = languages.map((l) => codeEditorLang2langExt[l]).flat();

const SubmitSolution: React.FC<{ onRun?: () => void | Promise<void>; submitting?: boolean }> = ({
  onRun,
  submitting,
}) => {
  if (submitting) {
    return (
      <div className={`${styles.SubmitSolution} ${styles.SolutionTesting}`}>
        <LoadingOutlined spin />
        <FormattedMessage id="problem-solving.running" />
      </div>
    );
  }
  return (
    <div className={styles.SubmitSolution} onClick={() => onRun?.()}>
      <FormattedMessage id="problem-solving.submit" />
    </div>
  );
};

interface ISolutionBar {
  onRun?: () => void | Promise<void>;
  currentLang: TCodeEditorLang | undefined;
  onChangeLang: (lang: TCodeEditorLang) => void;
  langs?: { ext: string; name: string }[];
  problemId: string;
  dispatch?: any;
  isSubmitting?: boolean;
}
const SolutionBar: React.FC<ISolutionBar> = ({
  onRun,
  langs,
  currentLang,
  onChangeLang,
  dispatch,
  isSubmitting,
}) => {
  const langExtAvailable = useMemo(() => {
    const langExt = (langs || []).map((l) => l.ext);
    const langExtensionAvailable = langExt || undefined;
    return langExtensionAvailable.length > 0
      ? languageExtSupported.filter((ext) => langExtensionAvailable.includes(ext))
      : languageExtSupported;
  }, [langs]);

  const handleChangeLang = (codeLang: TCodeEditorLang) => {
    onChangeLang(codeLang);
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

  const langOptions = (langs || [])
    .filter((l: any) => langExtAvailable.includes(l.ext))
    .map((l) => ({ value: l.ext, label: l.name }));

  return (
    <div className={styles.SolutionBar}>
      <SubmitSolution onRun={onRun} submitting={isSubmitting} />
      <div className={styles.SolutionBarActions}>
        <Select<TCodeEditorLang>
          options={langOptions}
          onChange={(v: TCodeEditorLang) => onChangeLang?.(v)}
          value={currentLang}
          style={{ width: '100px' }}
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
})(SolutionBar);
