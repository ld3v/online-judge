import { InputMarkdown } from '@/components/CardWrapForm/Input';
import { Button, Form, Input, Modal, notification } from 'antd';
import { connect, FormattedMessage, useIntl } from 'umi';

interface ICreateNotificationModal {
  visible?: boolean;
  dispatch?: any;
}

const CreateNotificationModal: React.FC<ICreateNotificationModal> = ({ visible, dispatch }) => {
  const intl = useIntl();

  const handleClose = () => {
    dispatch({ type: 'notification/modalCreateVisible' });
  };
  const handleSubmit = ({ title, text }: any) => {
    const callback = (res: any) => {
      if (res) {
        notification.success({
          message: intl.formatMessage({ id: 'notification.create.success' }),
        });
      }
    };
    dispatch({
      type: 'notification/create',
      payload: {
        title,
        text,
        callback,
      },
    });
  };
  return (
    <Modal
      open={visible}
      title={intl.formatMessage({ id: 'notification.create' })}
      closable
      onCancel={() => handleClose()}
      maskClosable={false}
      footer={null}
    >
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label={intl.formatMessage({ id: 'notification.form.title.label' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'notification.form.title.required' }),
            },
          ]}
        >
          <Input placeholder={intl.formatMessage({ id: 'notification.form.title.placeholder' })} />
        </Form.Item>
        <Form.Item
          name="text"
          label={intl.formatMessage({ id: 'notification.form.content.label' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'notification.form.content.required' }),
            },
          ]}
        >
          <InputMarkdown />
        </Form.Item>
        <Button htmlType="submit">
          <FormattedMessage id="notification.form.create-title" />
        </Button>
      </Form>
    </Modal>
  );
};

export default connect(({ notification, loading }: any) => ({
  visible: notification.createModalVisible,
  creating: loading.effects['notification/create'],
}))(CreateNotificationModal);
