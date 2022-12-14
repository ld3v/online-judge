import AceEditor, { IAceEditorProps } from 'react-ace';
import { TCodeEditorLang } from '@/components/Code/CodeEditor/language';
import { langExt2CodeEditorLang } from '@/components/Code/CodeEditor/utils';
import { Form, FormProps } from 'antd';
import styles from './styles.less';

import languages from '@/components/Code/CodeEditor/language';
import('ace-builds/webpack-resolver');
// Load initial modes & themes
languages.forEach((lang) => {
  import(`ace-builds/src-noconflict/mode-${lang}`);
  import(`ace-builds/src-noconflict/snippets/${lang}`);
});
import('ace-builds/src-noconflict/theme-dracula');
import('ace-builds/src-noconflict/ext-searchbox');
import('ace-builds/src-noconflict/ext-language_tools');

interface IEditor {
  currentLang?: TCodeEditorLang;
  editorProps?: IAceEditorProps;
  // Use for form item
  onChange?: (codeValue: string) => void;
  value?: string;
}
const Editor: React.FC<IEditor> = ({ currentLang, onChange, value, editorProps }) => {
  return (
    <AceEditor
      mode={currentLang ? langExt2CodeEditorLang[currentLang] : undefined}
      theme="dracula"
      onChange={onChange}
      name="ACE_CODE_EDITOR"
      width="100%"
      height="calc(100vh - 72px)"
      editorProps={{ $blockScrolling: true }}
      value={value}
      {...(editorProps || {})}
    />
  );
};

interface ISolutionEditor {
  currentLang?: TCodeEditorLang;
  editorProps?: IAceEditorProps;
  onSubmitCode?: FormProps['onFinish'];
  form?: FormProps['form'];
}
const SolutionEditor: React.FC<ISolutionEditor> = ({
  currentLang,
  editorProps,
  form,
  onSubmitCode,
}) => {
  const currentForm = form || Form.useForm()[0];

  return (
    <Form layout="vertical" form={currentForm} onFinish={onSubmitCode}>
      <Form.Item name="codeEditor" className={styles.SolutionEditorInput}>
        <Editor currentLang={currentLang} editorProps={editorProps} />
      </Form.Item>
    </Form>
  );
};

export default SolutionEditor;
