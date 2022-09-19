import { FORGOT_PASSWORD_PATH, REGISTER_PATH } from '@/utils/constants';
import { Button, Form, Input } from 'antd';
import { FC, useEffect, useState } from 'react';
import { connect, FormattedMessage, Redirect, history, useIntl, Link } from 'umi';
import styles from './styles.less';

interface ILoginPage {
  submitting: boolean;
  authenticated: boolean;
  dispatch: any;
}

const LoginPage: FC<ILoginPage> = ({ submitting, authenticated, dispatch }) => {
  const [isRegisterEnabled, setIsRegisterEnabled] = useState<boolean>(false);
  const intl = useIntl();

  useEffect(() => {
    const callback = (status: boolean) => {
      setIsRegisterEnabled(!!status);
    };
    dispatch({ type: 'settings/getRegisterStatus', payload: { callback } });
  }, []);

  const onContinue = ({ username, password }: any) => {
    const callback = (isDone: boolean = false) => {
      if (isDone) {
        history.push('/');
      }
    };
    dispatch({
      type: 'auth/login',
      payload: { username, password, callback, msg: intl.formatMessage },
    });
  };

  if (authenticated) {
    return <Redirect to="/" />;
  }

  return (
    <div className={styles.formWrapper}>
      <div className="formWrapper">
        <h2 className="title">
          <FormattedMessage id="auth.login.title" />
        </h2>
        <Form layout="vertical" requiredMark={false} onFinish={onContinue}>
          <Form.Item
            name="username"
            label={intl.formatMessage({ id: 'auth.form.username.label' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'auth.form.username.fieldRequired' }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({ id: 'auth.form.username.placeholder' })}
              disabled={submitting}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={intl.formatMessage({ id: 'auth.form.password.label' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'auth.form.password.fieldRequired' }),
              },
            ]}
          >
            <Input.Password
              placeholder={intl.formatMessage({ id: 'auth.form.password.placeholder' })}
              disabled={submitting}
            />
          </Form.Item>
          <Button block type="primary" htmlType="submit">
            {submitting ? (
              <FormattedMessage id="auth.login.submitting" />
            ) : (
              <FormattedMessage id="auth.login.submit" />
            )}
          </Button>
          <div className={styles.formActions}>
            <Link to={FORGOT_PASSWORD_PATH}>
              <FormattedMessage id="auth.forgot-password.title" />
            </Link>
            {isRegisterEnabled && (
              <Link to={REGISTER_PATH}>
                <FormattedMessage id="auth.register.title" />
              </Link>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};

const mapStatesToProps = ({ loading, account }: any) => {
  const submitting = loading.effects['auth/login'];
  const { current } = account;
  return {
    submitting,
    authenticated: !!current,
  };
};

export default connect(mapStatesToProps)(LoginPage);
