import { EMAIL_REGEX, LOGIN_PATH } from '@/utils/constants';
import { Button, Form, Input, notification } from 'antd';
import { FC, useEffect } from 'react';
import { connect, FormattedMessage, Redirect, history, useIntl, Link } from 'umi';
import styles from './styles.less';

interface IRegisterPage {
  submitting: boolean;
  authenticated: boolean;
  dispatch: any;
}

const RegisterPage: FC<IRegisterPage> = ({ submitting, authenticated, dispatch }) => {
  const intl = useIntl();

  useEffect(() => {
    const callback = (status: boolean) => {
      if (!status) {
        notification.error({ message: intl.formatMessage({ id: 'system.register.disabled' }) });
        history.push('/');
      }
    };
    dispatch({ type: 'settings/getRegisterStatus', payload: { callback } });
  }, []);

  const onContinue = ({ username, password, display_name, email }: any) => {
    const callback = (isDone: boolean = false) => {
      if (isDone) {
        history.push('/');
      }
    };
    dispatch({
      type: 'auth/register',
      payload: { username, password, display_name, email, callback, msg: intl.formatMessage },
    });
  };

  if (authenticated) {
    return <Redirect to="/" />;
  }

  return (
    <div className={styles.formWrapper}>
      <div className="formWrapper">
        <h2 className="title">
          <FormattedMessage id="auth.register.title" />
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
          <Form.Item
            name="display_name"
            label={intl.formatMessage({ id: 'auth.form.display-name.label' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'auth.form.display-name.fieldRequired' }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({ id: 'auth.form.display-name.placeholder' })}
              disabled={submitting}
            />
          </Form.Item>
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
          <Button block type="primary" htmlType="submit">
            {submitting ? (
              <FormattedMessage id="auth.register.submitting" />
            ) : (
              <FormattedMessage id="auth.register.submit" />
            )}
          </Button>
          <div className={styles.formActions}>
            <Link to={LOGIN_PATH}>
              <FormattedMessage id="auth.login.title" />
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

const mapStatesToProps = ({ loading, account }: any) => {
  const submitting = loading.effects['auth/register'];
  const { current } = account;
  return {
    submitting,
    authenticated: !!current,
  };
};

export default connect(mapStatesToProps)(RegisterPage);
