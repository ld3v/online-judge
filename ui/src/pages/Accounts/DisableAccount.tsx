import Card from '@/components/Card';
import CardWrapForm from '@/components/CardWrapForm';
import { Alert, Button, Form, Input, notification } from 'antd';
import { connect, FormattedHTMLMessage, FormattedMessage, useIntl } from 'umi';

interface IDisableAccount {
  account: any;
  dispatch?: any;
  currentAccountId?: string;
  updatingState?: boolean;
}

const DisableAccount: React.FC<IDisableAccount> = ({
  account,
  dispatch,
  updatingState,
  currentAccountId,
}) => {
  const intl = useIntl();

  if (!account || account.isRoot) {
    console.log(account);
    return null;
  }

  const handleSubmit = (values: any = {}) => {
    const callback = (res: any) => {
      if (res) {
        notification.success({
          message: intl.formatMessage(
            { id: 'account.state.success' },
            { isLock: !account.isLocked },
          ),
        });
      }
    };
    dispatch({
      type: 'account/updateState',
      payload: {
        id: account.id,
        reason: values.reason,
        state: account.isLocked ? 'unlock' : 'lock',
        callback,
      },
    });
  };

  if (account.isLocked) {
    return (
      <Card cardTitle={intl.formatMessage({ id: 'account.enable.title' })}>
        {/* <div className="form-description">
          <FormattedHTMLMessage id="account.enable.description" />
        </div> */}
        <Button onClick={() => handleSubmit()} loading={updatingState} danger>
          <FormattedMessage id="account.enable.submit-title" />
        </Button>
      </Card>
    );
  }

  return (
    <CardWrapForm
      cardTitle={intl.formatMessage({ id: 'account.disable.title' })}
      submitTitle={intl.formatMessage({ id: 'account.disable.submit-title' })}
      onFinish={handleSubmit}
      submitting={updatingState}
      buttonDanger
    >
      {currentAccountId === account.id && (
        <Alert
          description={<FormattedHTMLMessage id="account.disable.description.lock-me" />}
          type="warning"
          showIcon
          style={{ marginBottom: '10px' }}
        />
      )}

      {!account.email && (
        <Alert
          description={<FormattedHTMLMessage id="account.disable.description.no-email" />}
          type="warning"
          showIcon
          style={{ marginBottom: '10px' }}
        />
      )}
      <Form.Item
        name="reason"
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'exception.account.disable.reason.required' }),
          },
        ]}
      >
        <Input.TextArea
          placeholder={intl.formatMessage({ id: 'account.disable.reason.placeholder' })}
          autoSize={{ minRows: 4, maxRows: 10 }}
          showCount
        />
      </Form.Item>
    </CardWrapForm>
  );
};

export default connect(({ account, loading }: any) => ({
  currentAccountId: account.current,
  updatingState: loading.effects['account/updateState'],
}))(DisableAccount);
