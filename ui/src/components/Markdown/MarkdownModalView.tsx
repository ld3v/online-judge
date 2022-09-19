import { Modal, ModalProps, Skeleton } from 'antd';
import MarkdownView from './MarkdownView';

interface IMarkdownModalView extends ModalProps {
  preloading?: boolean;
  children?: string & React.ReactNode;
}

const MarkdownModalView: React.FC<IMarkdownModalView> = ({ preloading, children, ...props }) => {
  if (preloading) {
    return (
      <Modal closable={false} maskClosable={false} title={null} footer={null}>
        <Skeleton active />
      </Modal>
    );
  }

  return (
    <Modal closable maskClosable={false} footer={null} {...props}>
      <MarkdownView children={children || ''} />
    </Modal>
  );
};

export default MarkdownModalView;
