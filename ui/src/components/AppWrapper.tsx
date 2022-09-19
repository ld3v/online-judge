import type { FC } from 'react';
import type { IntlShape } from 'react-intl';
import { useEffect } from 'react';
import { ConnectProps, useHistory, useIntl } from 'umi';
import { connect } from 'umi';

import { currentAccount } from '@/services/account';
import { LOGIN_PATH, NON_AUTH_NOT_REDIRECT_PATHS, NON_AUTH_PATHS } from '@/utils/constants';
import React from 'react';
import { useModel } from 'umi';

import type { TAccount } from '@/types/account';
import { getConfigurations } from '@/services';
import { notification } from 'antd';

interface ILayout extends ConnectProps {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}

const initAccount = async (cb: (account: TAccount) => void) => {
  try {
    const accountInfo = await currentAccount();
    if (!accountInfo || accountInfo.isError) {
      throw Error('Account is invalid');
    }
    cb(accountInfo);
    return accountInfo;
  } catch (err) {
    console.error('Error while trying to get account info with token:', err);
  }
  localStorage.removeItem(`${LC_STR_PREFIX}AUTH`);
  return false;
};

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

const AppWrapper: FC<ILayout> = ({ children, dispatch, ...props }: any) => {
  const intl = useIntl();
  const history = useHistory();
  const { initialState, setInitialState }: any = useModel('@@initialState');
  const { account } = initialState;

  const setAccount = (accountInfo: TAccount) => {
    setInitialState((curState: any) => ({ ...curState, account: accountInfo }));
    dispatch({
      type: 'account/saveCurrent',
      payload: accountInfo,
    });
    if (NON_AUTH_PATHS.includes(window.location.pathname)) {
      history.push('/dashboard');
    }
  };

  useEffect(() => {
    getConfigs(intl);
  }, []);

  useEffect(() => {
    const authToken = localStorage.getItem(`${LC_STR_PREFIX}AUTH`);
    if (!account && authToken) {
      // Just reload, or first time run
      initAccount(setAccount);
      return;
    }
    if (
      ![...NON_AUTH_PATHS, ...NON_AUTH_NOT_REDIRECT_PATHS].includes(window.location.pathname) &&
      !account
    ) {
      history.push(LOGIN_PATH);
      return;
    }
    if (account && window.location.pathname === LOGIN_PATH) {
      history.push('/dashboard');
      return;
    }
  }, [account, window.location.pathname]);

  return React.cloneElement(children, { ...props, role: account?.role });
};

export default connect()(AppWrapper);
