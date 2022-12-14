import React, { useEffect } from 'react';
import type { FC } from 'react';
import type { IntlShape } from 'react-intl';
import { connect, ConnectProps, useHistory, useIntl } from 'umi';
import { notification } from 'antd';
import { LOGIN_PATH, NON_AUTH_NOT_REDIRECT_PATHS, NON_AUTH_PATHS } from '@/utils/constants';
import useAccountInfo from '@/utils/hooks/useAccountInfo';
import { getConfigurations } from '@/services';
import LoadingWrapper from './LoadingWrapper';
import { TAccount } from '@/types/account';

interface ILayout extends ConnectProps {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  current?: string;
}

const getConfigs = async (intl: IntlShape) => {
  try {
    const configs = await getConfigurations();
    if (configs.isError) {
      if (configs.notify) {
        notification.error({ message: intl.formatMessage({ id: configs.notify }) });
      }
      return;
    }
    localStorage.removeItem(`${LC_STR_PREFIX}MAINTENANCE`);
    localStorage.setItem(`${LC_STR_PREFIX}CONFIGS`, JSON.stringify(configs));
  } catch (err) {
    console.error('Something went wrong when trying to get configs:', err);
  }
};

const AppWrapper: FC<ILayout> = ({ children, current, dispatch, ...props }: any) => {
  const intl = useIntl();
  const history = useHistory();

  const accountInfoCb = async (accountInfo: TAccount | undefined) => {
    await dispatch({
      type: 'account/saveCurrent',
      payload: accountInfo,
    });
    console.log(accountInfo, window.location.pathname);
    if (
      ![...NON_AUTH_PATHS, ...NON_AUTH_NOT_REDIRECT_PATHS].includes(window.location.pathname) &&
      !accountInfo
    ) {
      history.push(LOGIN_PATH);
      return;
    }
    if (accountInfo && window.location.pathname === LOGIN_PATH) {
      history.push('/dashboard');
      return;
    }
  };
  const {
    account,
    setAccount,
    loading: loadingAccount,
  } = useAccountInfo({ callback: accountInfoCb });

  useEffect(() => {
    getConfigs(intl);
  }, []);

  if (loadingAccount) {
    return <LoadingWrapper />;
  }

  return React.cloneElement(children, { ...props, role: account?.role, account, setAccount });
};

export default connect(({ account }: any) => ({ current: account.dic[account.current] }))(
  AppWrapper,
);
