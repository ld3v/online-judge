import { Button, Form, FormProps, Input } from 'antd';
import { FormattedMessage, useIntl } from 'umi';
import CodeEditor, { ICodeEditor } from '../Code/CodeEditor';
import { TCodeEditorLang } from '../Code/CodeEditor/language';

import styles from './styles.less';

interface IDoProblem extends FormProps {
  codeEditorProps?: ICodeEditor;
  submitTitleId?: string;
  notAllowedDo?: boolean;
  problemId: string | undefined;
  checking: {
    // submissionId: string;
    result: string | undefined;
    loading: boolean;
  };
}

const DoProblem: React.FC<IDoProblem> = ({
  codeEditorProps,
  notAllowedDo,
  submitTitleId,
  form,
  problemId,
  checking,
  ...props
}) => {
  const intl = useIntl();
  const [current] = Form.useForm();

  if (notAllowedDo) {
    return null;
  }

  const handleChangeLang = (newLang: TCodeEditorLang) => {
    const currentForm = form || current;
    if (currentForm) {
      currentForm.setFieldsValue({ languageExtension: newLang, code: '' });
      return;
    }
    console.error('[DoProblem] - currentForm is not available to set value!');
  };

  return (
    <Form form={form || current} {...props} layout="vertical">
      <Form.Item name="code">
        <CodeEditor onChangeLang={handleChangeLang} problemId={problemId} {...codeEditorProps} />
      </Form.Item>
      <div className={styles.CodeProcessing}>
        <Button htmlType="submit" loading={checking.loading}>
          <FormattedMessage id={submitTitleId || 'component.form.submit'} />
        </Button>
        <div className={styles.CodeProcessingState}>
          {checking.loading
            ? intl.formatMessage({ id: 'problem-solving.checking-solution' })
            : checking.result || ''}
        </div>
      </div>
      {/* BELOW INPUTS SET VALUE BY FORM REF */}
      <Form.Item name="assignmentId" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="problemId" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="languageExtension" hidden>
        <Input />
      </Form.Item>
    </Form>
  );
};

export default DoProblem;
