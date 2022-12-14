import { TCodeEditorLang } from '@/components/Code/CodeEditor/language';
import { Form, FormProps, notification } from 'antd';
import React, { useState } from 'react';
import { useIntl } from 'umi';
import SolutionBar from './SolutionBar';
import SolutionEditor from './SolutionEditor';
import styles from './styles.less';

interface ISolutionView {
  problemId: string;
  onRunCode?: (
    code: string,
    langExt: TCodeEditorLang,
    clearCode?: () => void,
  ) => void | Promise<void>;
}
const SolutionView: React.FC<ISolutionView> = ({ problemId, onRunCode }) => {
  const intl = useIntl();
  const [codeEditorForm] = Form.useForm();
  const [codeLang, setLang] = useState<TCodeEditorLang | undefined>(undefined);
  const [isSubmitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit: FormProps['onFinish'] = async ({ codeEditor }) => {
    if (!codeEditor || codeEditor.trim() === '') {
      notification.error({
        message: intl.formatMessage({ id: 'exception.problem-solving.code-empty' }),
        placement: 'bottomRight',
        bottom: 10,
      });
      return;
    }
    if (!codeLang) {
      notification.error({
        message: intl.formatMessage({ id: 'exception.problem-solving.lang-no-select' }),
        placement: 'bottomRight',
        bottom: 10,
      });
      return;
    }
    setSubmitting(true);
    await onRunCode?.(codeEditor, codeLang);
    setSubmitting(false);
  };

  return (
    <div className={styles.SolutionWrapper}>
      <SolutionBar
        currentLang={codeLang}
        onChangeLang={(v: TCodeEditorLang) => setLang(v)}
        problemId={problemId}
        onRun={() => codeEditorForm.submit()}
        isSubmitting={isSubmitting}
      />
      <div className={styles.SolutionContent}>
        <SolutionEditor form={codeEditorForm} currentLang={codeLang} onSubmitCode={handleSubmit} />
      </div>
    </div>
  );
};

export default SolutionView;
