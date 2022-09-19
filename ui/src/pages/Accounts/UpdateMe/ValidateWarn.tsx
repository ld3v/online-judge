import { Button, notification } from 'antd';
import { useState } from 'react';
import { connect, FormattedHTMLMessage, FormattedMessage, useIntl } from 'umi';

interface IValidateWarn {
  className?: string;
  contentClassName?: string;
  dispatch?: any;
  currentAccount?: any;
  sendingNewValidate?: boolean;
}

const ValidateWarn: React.FC<IValidateWarn> = ({
  className,
  contentClassName,
  dispatch,
  currentAccount,
  sendingNewValidate,
}) => {
  const intl = useIntl();

  const [sentValidate, setSentValidate] = useState<boolean>(false);

  const handleResend = () => {
    const callback = (res: any) => {
      if (!res) {
        notification.error({ message: intl.formatMessage({ id: 'auth.re-validate.sent.failed' }) });
        return;
      }
      notification.success({
        message: intl.formatMessage({ id: 'auth.re-validate.sent.success' }),
      });
      setSentValidate(true);
    };

    dispatch({
      type: 'auth/reSendValidate',
      payload: {
        callback,
      },
    });
  };

  const renderResend = () => {
    return (
      <Button
        onClick={sendingNewValidate ? undefined : handleResend}
        type="primary"
        loading={sendingNewValidate}
      >
        <FormattedMessage id="auth.re-validate.resend" />
      </Button>
    );
  };

  if (sentValidate || currentAccount?.isValidated) {
    return null;
  }

  return (
    <div className={className}>
      <div className={contentClassName || ''}>
        <FormattedHTMLMessage id="auth.re-validate.message" />
      </div>
      {renderResend()}
    </div>
  );
};

export default connect(({ account, loading }: any) => ({
  currentAccount: account.dic[account.current],
  sendingNewValidate: loading.effects['auth/reSendValidate'],
}))(ValidateWarn);
