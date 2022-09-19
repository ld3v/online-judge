import { AuthInfoResponse } from '@/types/auth';
import { Button, Form, Input, notification } from 'antd';
import { connect, FormattedHTMLMessage, FormattedMessage, useHistory, useIntl } from 'umi';
import styles from './styles.less';

interface ResetPasswordProps {
  token: string;
  auth: AuthInfoResponse;
  resetting?: boolean;
  dispatch?: any;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ token, auth, resetting, dispatch }) => {
  const intl = useIntl();
  const history = useHistory();

  const onContinue = ({ password }: any) => {
    const callback = (res: any, isSuccess: boolean = true) => {
      if (isSuccess) {
        notification.success({
          message: intl.formatMessage({ id: 'auth.reset-password.result.success' }),
        });
        history.push('/');
        return;
      }
      notification.error({
        message: res.messageId ? intl.formatMessage({ id: res.messageId }) : res.message,
      });
    };
    dispatch({
      type: 'auth/resetPassword',
      payload: { token, password, callback },
    });
  };

  return (
    <div className={styles.resetPassword}>
      <h2>
        <FormattedMessage id="auth.reset-password.title" />
      </h2>
      <div className="desc">
        <FormattedHTMLMessage id="auth.reset-password.desc" values={{ email: auth.email }} />
      </div>
      <Form layout="vertical" requiredMark={false} onFinish={onContinue}>
        <Form.Item
          name="password"
          label={intl.formatMessage({ id: 'auth.form.new-password.label' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'auth.form.new-password.fieldRequired' }),
            },
          ]}
        >
          <Input.Password
            placeholder={intl.formatMessage({ id: 'auth.form.new-password.placeholder' })}
            disabled={resetting}
          />
        </Form.Item>
        <Form.Item
          name="rePassword"
          label={intl.formatMessage({ id: 'auth.form.re-new-password.label' })}
          dependencies={['password']}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'auth.form.re-new-password.fieldRequired' }),
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(intl.formatMessage({ id: 'exception.auth.form.no-same-password' })),
                );
              },
            }),
          ]}
        >
          <Input.Password
            placeholder={intl.formatMessage({
              id: 'auth.form.re-new-password.placeholder',
            })}
            disabled={resetting}
          />
        </Form.Item>
        <Button block type="primary" htmlType="submit">
          {resetting ? (
            <FormattedMessage id="auth.reset-password.submitting" />
          ) : (
            <FormattedMessage id="auth.reset-password.submit" />
          )}
        </Button>
      </Form>
    </div>
  );
};

export default connect(({ loading }: any) => ({
  resetting: loading.effects['auth/resetPassword'],
}))(ResetPassword);
