import ResetPassword from '@/components/Auth/ResetPassword';
import Validate from '@/components/Auth/Validate';
import { AuthInfoResponse } from '@/types/auth';
import { useEffect, useState } from 'react';
import { connect, FormattedHTMLMessage, Redirect, useHistory } from 'umi';
import styles from './styles.less';

interface IAuthHandlePage {
  finding: boolean;
  current?: any;
  isLoggedIn?: boolean;
  dispatch: any;
  children: any;
}
interface IDefaultAuthContent {
  message: string;
  variables?: Record<string, string>;
}

const DefaultAuthContent: React.FC<IDefaultAuthContent> = ({ message, variables }) => (
  <>
    <img src="/finding.png" alt="finding-info" />
    <div className={styles.content}>
      <FormattedHTMLMessage id={message} values={variables || {}} />
    </div>
  </>
);

const AuthHandlePage: React.FC<IAuthHandlePage> = ({ current, isLoggedIn, dispatch }) => {
  const [message, setMessage] = useState<string>('auth.handler.finding');
  const [currentAuth, setAuth] = useState<AuthInfoResponse>({ email: '', purpose: '' });
  const history = useHistory();
  const {
    location: {
      query: { token },
    },
  }: any = history;
  if (!token) {
    return <Redirect to="/" />;
  }
  const getByTokenCb = (info: AuthInfoResponse, status: boolean = true) => {
    if (!status && (info.messageId === 'auth.invalid' || info.messageId === 'auth.notfound')) {
      setMessage('auth.handler.notfound');
      return;
    }
    // Handle redirect to `/` when logged-in
    if (isLoggedIn && info.purpose === 'RESET_PASSWORD') {
      window.location.href = '/dashboard';
      return;
    }

    setAuth(info);
  };
  useEffect(() => {
    if (token) {
      dispatch({ type: 'auth/getByToken', payload: { token, callback: getByTokenCb } });
    }
  }, []);
  if (current) {
    let content = (
      <DefaultAuthContent
        message="auth.handler.unknown-purpose"
        variables={{ purpose: current.purpose }}
      />
    );
    if (current.purpose === 'RESET_PASSWORD') {
      content = <ResetPassword auth={currentAuth} token={token} />;
    }
    if (current.purpose === 'VERIFY_EMAIL' || current.purpose === 'REVERIFY_EMAIL') {
      content = <Validate auth={currentAuth} token={token} />;
    }
    return <div className={styles.authHandlePage}>{content}</div>;
  }
  return (
    <div className={styles.authHandlePage}>
      <DefaultAuthContent message={message} />
    </div>
  );
};

export default connect(({ auth, account, loading }: any) => ({
  finding: loading.effects['auth/getByToken'],
  isLoggedIn: !!account.current,
  current: auth.current,
}))(AuthHandlePage);
