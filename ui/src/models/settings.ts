import { checkRegisterAvailable, getAllSettings, getJudgeURL, getSyncAllDataStatus, syncAllData, syncSettings, updateSettings } from '@/services/setting';
import { TQueue } from '@/types/queue';
import { array2Map } from '@/utils/funcs';
import type { Model } from 'dva';
import type { Effect, Reducer } from 'umi';

type TSettingState = {
  dic: Record<string, any>;
  list: any[];
  syncAllHistory: Record<string, TQueue>;
};

interface ISettingModel extends Model {
  state: TSettingState;
  effects: {
    getAll: Effect;
    getRegisterStatus: Effect;
    update: Effect;
    sync: Effect;
    getJudgeURL: Effect;
    syncAllData: Effect;
    syncAllDataStatus: Effect;
  };
  reducers: {
    save: Reducer;
    saveSyncAllHistory: Reducer;
  };
}

const SettingModel: ISettingModel = {
  namespace: 'settings',
  state: {
    dic: {},
    list: [],
    syncAllHistory: {},
  },
  effects: {
    *getAll({ payload }, { call, put }): Generator<any, any, any> {
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
    *getRegisterStatus({ payload }, { call }): Generator<any, any, any> {
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
    *update({ payload }, { call, put }): Generator<any, any, any> {
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
    *getJudgeURL({ payload }, { call }): Generator<any, any, any> {
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
    *sync({ payload }, { call, put }): Generator<any, any, any> {
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
    *syncAllDataStatus({ payload }, { call, put }): Generator<any, any, any> {
      const { callback } = payload || {};
      try {
        const res = yield call(getSyncAllDataStatus);
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        // Refresh data
        const { history, current } = res;
        const { map: historyMapping, keys: historyIds } = array2Map([...history, ...(current ? [current] : [])], "id");
        yield put({ type: 'saveSyncAllHistory', payload: historyMapping });
        callback?.(
          {
            historyIds: historyIds.filter(id => id !== current?.id),
            currentId: current?.id,
          },
          null,
          current || {},
        );
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [SETTINGS/SYNC-ALL-DATA-STATUS]:', err);
        callback?.(false, err);
      }
    },
    *syncAllData({ payload }, { call, put }): Generator<any, any, any> {
      const { callback } = payload || {};
      try {
        const res = yield call(syncAllData);
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        yield put({ type: 'saveSyncAllHistory', payload: { [res.id]: res } });
        // Refresh data
        callback?.(res.id);
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [SETTINGS/SYNC-ALL-DATA]:', err);
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
    saveSyncAllHistory(state, { payload }) {
      return {
        ...state,
        syncAllHistory: {
          ...state.syncAllHistory,
          ...payload,
        }
      };
    }
  },
};

export default SettingModel;
