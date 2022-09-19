import { get, getAccountById, updateAccountById, updateAccountState } from '@/services/account';
import { array2Map } from '@/utils/funcs';
import type { Model } from 'dva';
import type { Effect, Reducer } from 'umi';

type TAccountState = {
  dic: Record<string, any>;
  current?: string;
  selected?: string;
};

interface IAccountModel extends Model {
  state: TAccountState;
  effects: {
    search: Effect;
    getById: Effect;
    loadMe: Effect;
    updateById: Effect;
    updateState: Effect;
  }
  reducers: {
    saveCurrent: Reducer;
    saveSelected: Reducer;
    saveList: Reducer;
    saveDic: Reducer;
    updateFieldValue: Reducer;
  };
}

const AccountModel: IAccountModel = {
  namespace: 'account',
  state: {
    current: undefined,
    selected: undefined,
    dic: {},
  },
  effects: {
    *search({ payload }, { call, put }) {
      const { keyword, except, role, page, limit, callback } = payload || {};
      try {
        const res = yield call(get, { keyword, except, page, limit, role });
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        const { map, keys } = array2Map(res.data, 'id');
        yield put({
          type: 'saveDic',
          payload: map,
        });
        callback?.({ keys, total: res.total });
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [ACCOUNT/SEARCH]:', keyword, err);
        callback?.(false, err);
      }
    },
    *updateById({ payload }, { call, put }) {
      const { id, data, callback } = payload || {};
      try {
        const res = yield call(updateAccountById, id, data);
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        const { map } = array2Map([res], "id");
        yield put({
          type: 'saveDic',
          payload: map,
        })
        callback?.(res);
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [ACCOUNT/UPDATE-BY-ID]:', data, err);
        callback?.(false, err);
      }
    },
    *getById({ payload }, { call, put }) {
      const { id, callback } = payload || {};
      try {
        const res = yield call(getAccountById, id);
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        yield put({
          type: 'saveSelected',
          payload: res,
        })
        callback?.(res);
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [ACCOUNT/GET-BY-ID]:', id, err);
        callback?.(false, err);
      }
    },
    *loadMe({ payload }, { call, put }) {
      const { callback } = payload || {};
      try {
        const res = yield call(getAccountById, 'me');
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        yield put({
          type: 'saveCurrent',
          payload: res,
        })
        callback?.(res);
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [ACCOUNT/LOAD-ME]:', err);
        callback?.(false, err);
      }
    },
    *updateState({ payload }, { call, put }) {
      const { id, state, reason, callback } = payload || {};
      try {
        const res = yield call(updateAccountState, id, state, reason);
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        // Refresh data
        yield put({ type: 'search' });
        callback?.(res);
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [ACCOUNT/UPDATE-STATE]:', id, err);
        callback?.(false, err);
      }
    },
  },
  reducers: {
    saveCurrent(state, { payload }) {
      return {
        ...state,
        dic: {
          ...state.dic,
          [payload.id]: payload,
        },
        current: payload.id,
      };
    },
    saveSelected(state, { payload }) {
      return {
        ...state,
        dic: {
          ...state.dic,
          [payload.id]: payload,
        },
        selected: payload.id,
      };
    },
    updateFieldValue(state, { payload }) {
      return {
        ...state,
        dic: {
          ...state.dic,
          [payload.key || state.current]: {
            ...state.dic[payload.key || state.current],
            [payload.field]: payload.value,
          }
        }
      }
    },
    saveList(state, { payload }) {
      const { map, keys } = array2Map(payload, 'id');
      return {
        ...state,
        dic: {
          ...state.dic,
          ...map,
        },
        list: keys,
      };
    },
    saveDic(state, { payload }) {
      return {
        ...state,
        dic: {
          ...state.dic,
          ...payload,
        },
      };
    },
  },
};

export default AccountModel;
