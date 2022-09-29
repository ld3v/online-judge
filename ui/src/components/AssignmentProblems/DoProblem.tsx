import { Button, Form, FormProps, Input } from 'antd';
import { FormattedMessage } from 'umi';
import CodeEditor, { ICodeEditor } from '../Code/CodeEditor';
import { TCodeEditorLang } from '../Code/CodeEditor/language';

interface IDoProblem extends FormProps {
  codeEditorProps?: ICodeEditor;
  submitTitleId?: string;
  notAllowedDo?: boolean;
  isSubmitting?: boolean;
}

const DoProblem: React.FC<IDoProblem> = ({
  codeEditorProps,
  notAllowedDo,
  submitTitleId,
  form,
  isSubmitting,
  ...props
}) => {
  const [current] = Form.useForm();

  if (notAllowedDo) {
    return null;
  }

  const handleChangeLang = (newLang: TCodeEditorLang) => {
    const currentForm = form || current;
    if (currentForm) {
      currentForm.setFieldsValue({ languageExtension: newLang });
      return;
    }
    console.error('[DoProblem] - currentForm is not available to set value!');
  };

  return (
    <Form form={form || current} {...props} layout="vertical">
      <Form.Item name="code">
        <CodeEditor onChangeLang={handleChangeLang} {...codeEditorProps} />
      </Form.Item>
      <Button htmlType="submit" loading={isSubmitting}>
        <FormattedMessage id={submitTitleId || 'component.form.submit'} />
      </Button>
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
