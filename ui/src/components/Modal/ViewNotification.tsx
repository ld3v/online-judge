import MarkdownModalView from '@/components/Markdown/MarkdownModalView';
import { connect } from 'umi';

interface IViewNotificationModal {
  visible?: boolean;
  dispatch?: any;
  selected?: any;
}

const ViewNotificationModal: React.FC<IViewNotificationModal> = ({
  visible,
  dispatch,
  selected,
}) => {
  const handleClose = () => {
    dispatch({ type: 'notification/select' });
  };

  return (
    <MarkdownModalView
      visible={visible}
      onCancel={handleClose}
      title={selected?.title}
      children={selected?.text}
    />
  );
};

export default connect(({ notification }: any) => ({
  visible: !!notification.selected,
  selected: notification.dic[notification.selected],
}))(ViewNotificationModal);
