import { Form, FormProps } from 'antd';
import CodeEditor, { ICodeEditor } from '../Code/CodeEditor';

interface IDoProblem extends FormProps {
  codeEditorProps?: ICodeEditor;
  notAllowedDo?: boolean;
}

const DoProblem: React.FC<IDoProblem> = ({ codeEditorProps, notAllowedDo, ...props }) => {
  if (notAllowedDo) {
    return null;
  }

  const handleSubmit = (values: any) => {
    console.info('CODE-EDITOR-VALUES', values);
  };

  return (
    <Form {...props} layout="vertical" onFinish={handleSubmit}>
      <Form.Item name="code">
        <CodeEditor {...codeEditorProps} />
      </Form.Item>
    </Form>
  );
};

export default DoProblem;
