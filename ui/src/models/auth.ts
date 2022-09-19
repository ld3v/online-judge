import type { Effect, Model } from 'dva';

import { login, getByToken, resetPassword, register, forgotPassword, validateEmail, reValidateEmail } from '@/services/auth';
import { notification } from 'antd';
import { Reducer } from 'umi';

type TAuthState = {
  authToken?: string;
  current?: any;
};

interface IAuthModel extends Model {
  state: TAuthState;
  effects: {
    login: Effect;
    register: Effect;
    forgotPassword: Effect;
    reSendValidate: Effect;
    validate: Effect;
    getByToken: Effect;
    resetPassword: Effect;
  };
  reducers: {
    saveCurrent: Reducer;
  };
}

const AuthModel: IAuthModel = {
  namespace: 'auth',
  state: {
    authToken: undefined,
    current: undefined,
  },
  effects: {
    *login({ payload }, { call }) {
      const { username, password, callback, msg } = payload || {};
      const res = yield call(login, {
        username,
        password,
      });
      if (res.isError) {
        notification.error({
          message:
            msg?.({ id: `exception.${res.messageId}`, defaultMessage: '' }, { isMany: false }) ||
            res.msg,
        });
        return;
      }
      const { account, token } = res;
      // console.log(token, LC_STR_PREFIX + 'AUTH');
      localStorage.setItem(LC_STR_PREFIX + 'AUTH', token);
      // console.log(account);
      callback?.(account);
    },
    *register({ payload }, { call }) {
      const { username, password, display_name, email, callback, msg } = payload || {};
      const res = yield call(register, {
        username,
        password,
        display_name,
        email,
      });
      if (res.isError) {
        notification.error({
          message:
            msg?.({ id: `exception.${res.messageId}`, defaultMessage: '' }, { isMany: false }) ||
            res.msg,
        });
        return;
      }
      const { account, token } = res;
      // console.log(token, LC_STR_PREFIX + 'AUTH');
      localStorage.setItem(LC_STR_PREFIX + 'AUTH', token);
      // console.log(account);
      callback?.(account);
    },
    *forgotPassword({ payload }, { call }) {
      const { email, callback, msg } = payload || {};
      const res = yield call(forgotPassword, email);
      if (res.isError) {
        notification.error({
          message:
            msg?.({ id: `exception.${res.messageId}`, defaultMessage: '' }, { isMany: false }) ||
            res.msg,
        });
        return;
      }
      callback?.(res);
    },
    *reSendValidate({ payload }, { call }) {
      const { callback } = payload || {};
      const res = yield call(reValidateEmail);
      if (res.isError) {
        callback?.(false, res);
        return;
      }
      callback?.(res);
    },
    *getByToken({ payload }, { call, put }) {
      const { token, callback } = payload || {};
      const authInfo = yield call(getByToken, token);
      if (authInfo.isError) {
        callback?.(authInfo, false);
        return;
      }
      yield put({ type: 'saveCurrent', payload: authInfo });
      callback?.(authInfo);
    },
    *resetPassword({ payload }, { call }) {
      const { token, password, callback } = payload || {};
      const res = yield call(resetPassword, token, password);
      console.log(res);
      if (res.isError) {
        callback?.(res, false);
        return;
      }
      callback?.(res);
    },
    *validate({ payload }, { call }) {
      const { token, callback } = payload || {};
      const res = yield call(validateEmail, token);
      console.log(res);
      if (res.isError) {
        callback?.(res, false);
        return;
      }
      callback?.(res);
    },
  },
  reducers: {
    saveCurrent(state, { payload }) {
      return {
        ...state,
        current: payload,
      };
    },
  },
};

export default AuthModel;
