import { TLanguageExt } from '@/components/Code/CodeEditor/language';
import { getMDContent } from '@/utils/funcs';
import { LoadingOutlined } from '@ant-design/icons';
import { Modal, ModalProps } from 'antd';

import styles from './styles.less';

interface IModalViewCode {
  onCancel: ModalProps['onCancel'];
  title: ModalProps['title'];
  code: string;
  codeExt: TLanguageExt | 'log';
  loading?: boolean;
  width?: ModalProps['width'];
}
const ModalViewCode: React.FC<IModalViewCode> = ({
  onCancel,
  title,
  code,
  codeExt,
  loading,
  width,
}) => {
  const htmlParsed = getMDContent(`\`\`\`${codeExt}\n${code}\n\`\`\``);

  if (loading) {
    return (
      <Modal open footer={null} onCancel={onCancel} title={title} width={width}>
        <div className={styles.ModalViewCodeLoading}>
          <LoadingOutlined spin />
        </div>
      </Modal>
    );
  }

  return (
    <Modal open footer={null} onCancel={onCancel} title={title} width={width}>
      <div dangerouslySetInnerHTML={{ __html: htmlParsed }} />
    </Modal>
  );
};

export default ModalViewCode;
