import { AuthInfoResponse } from '@/types/auth';
import { useEffect, useState } from 'react';
import { connect, FormattedMessage, Link } from 'umi';
import styles from './styles.less';

interface VerifyEmailProps {
  token: string;
  auth: AuthInfoResponse;
  validating?: boolean;
  dispatch?: any;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ token, validating, dispatch }) => {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const callback = (res: any) => {
      if (!res) {
        setMessage('exception.auth.validate.fail');
        return;
      }
      setMessage('auth.validate.success');
    };
    dispatch({
      type: 'auth/validate',
      payload: {
        token,
        callback,
      },
    });
  }, []);

  if (!message || validating) {
    return (
      <div className={`{${styles.validate} loading`}>
        <h2>
          <FormattedMessage id="auth.validate.title" />
        </h2>
        <div className={styles.content} />
      </div>
    );
  }

  return (
    <div className={styles.validate}>
      <h2>
        <FormattedMessage id="auth.validate.title" />
      </h2>

      <div className={styles.content}>
        <FormattedMessage id={message} />
        <br />
        <Link to="/">
          <FormattedMessage id="component.go-to-home" />
        </Link>
      </div>
    </div>
  );
};

export default connect(({ loading }: any) => ({
  validating: loading.effects['auth/validate'],
}))(VerifyEmail);
