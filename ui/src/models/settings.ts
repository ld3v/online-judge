import { checkRegisterAvailable, getAllSettings, getJudgeURL, syncSettings, updateSettings } from '@/services/setting';
import type { Model } from 'dva';
import type { Effect, Reducer } from 'umi';

type TSettingState = {
  dic: Record<string, any>;
  list: any[];
};

interface ISettingModel extends Model {
  state: TSettingState;
  effects: {
    getAll: Effect;
    getRegisterStatus: Effect;
    update: Effect;
    sync: Effect;
    getJudgeURL: Effect;
  };
  reducers: {
    save: Reducer;
  };
}

const SettingModel: ISettingModel = {
  namespace: 'settings',
  state: {
    dic: {},
    list: [],
  },
  effects: {
    *getAll({ payload }, { call, put }) {
      const { callback } = payload || {};
      try {
        const settings = yield call(getAllSettings);
        if (settings.isError) {
          callback?.()
          return;
        }
        yield put({ type: 'save', payload: settings });
        callback?.(settings);
      } catch (err) {
        console.error('Something went wrong when try to get all setting:', err);
        callback?.()
      }
    },
    *getRegisterStatus({ payload }, { call }) {
      const { callback } = payload || {};
      try {
        const status = yield call(checkRegisterAvailable);
        if (status.isError) {
          callback?.()
          return;
        }
        callback?.(status)
      } catch (err) {
        console.error('Something went wrong when try to check register status:', err);
        callback?.();
      }
    },
    *update({ payload }, { call, put }) {
      const { callback, data } = payload || {};
      try {
        const res = yield call(updateSettings, data);
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        // Refresh data
        yield put({ type: 'save', payload: res });
        callback?.(res);
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [SETTINGS/UPDATE]:', err);
        callback?.(false, err);
      }
    },
    *getJudgeURL({ payload }, { call }) {
      const { callback } = payload || {};
      try {
        const res = yield call(getJudgeURL);
        if (res.isError) {
          callback?.()
          return;
        }
        callback?.(res);
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [SETTINGS/GET-JUDGE-URL]:', err);
        callback?.()
      }
    },
    *sync({ payload }, { call, put }) {
      const { callback } = payload || {};
      try {
        const res = yield call(syncSettings);
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        // Refresh data
        yield put({ type: 'save', payload: res });
        callback?.(res);
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [SETTINGS/SYNC]:', err);
        callback?.(false, err);
      }
    },
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        dic: {
          ...state.dic,
          ...payload,
        },
        list: Object.keys(payload),
      };
    },
  },
};

export default SettingModel;
