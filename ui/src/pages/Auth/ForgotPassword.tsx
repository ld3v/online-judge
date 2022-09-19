import { EMAIL_REGEX } from '@/utils/constants';
import { Button, Form, Input } from 'antd';
import { FC, useState } from 'react';
import { connect, FormattedHTMLMessage, FormattedMessage, Redirect, useIntl } from 'umi';
import styles from './styles.less';

interface IForgotPasswordPage {
  submitting: boolean;
  authenticated: boolean;
  dispatch: any;
}

const ForgotPasswordPage: FC<IForgotPasswordPage> = ({ submitting, authenticated, dispatch }) => {
  const [isSentRequest, setIsSentRequest] = useState<boolean>(false);
  const intl = useIntl();

  const onContinue = ({ email }: any) => {
    const callback = (isDone: boolean = false) => {
      if (isDone) {
        setIsSentRequest(true);
        return;
      }
    };
    dispatch({
      type: 'auth/forgotPassword',
      payload: { email, callback, msg: intl.formatMessage },
    });
  };

  if (authenticated) {
    return <Redirect to="/" />;
  }

  if (isSentRequest) {
    return (
      <div className={styles.formWrapper}>
        <div className="formWrapper notify-box">
          <img src="/email.png" alt="email" />
          <div>
            <FormattedHTMLMessage id="auth.forgot-password.sent-request.description" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formWrapper}>
      <div className="formWrapper">
        <h2 className="title">
          <FormattedMessage id="auth.forgot-password.title" />
        </h2>
        <Form layout="vertical" requiredMark={false} onFinish={onContinue}>
          <Form.Item
            name="email"
            label={intl.formatMessage({ id: 'auth.form.email.label' })}
            rules={[
              () => ({
                validator(_, value) {
                  if (!value) {
                    return Promise.reject(
                      new Error(intl.formatMessage({ id: 'auth.form.email.fieldRequired' })),
                    );
                  }
                  if (!EMAIL_REGEX.test(value)) {
                    return Promise.reject(
                      new Error(intl.formatMessage({ id: 'exception.email.invalid' })),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input
              placeholder={intl.formatMessage({ id: 'auth.form.email.placeholder' })}
              disabled={submitting}
            />
          </Form.Item>
          <Button block type="primary" htmlType="submit" loading={submitting}>
            <FormattedMessage id="auth.forgot-password.submit" />
          </Button>
        </Form>
      </div>
    </div>
  );
};

const mapStatesToProps = ({ loading, account }: any) => {
  const submitting = loading.effects['auth/forgotPassword'];
  const { current } = account;
  return {
    submitting,
    authenticated: !!current,
  };
};

export default connect(mapStatesToProps)(ForgotPasswordPage);
