import { getAllLangs } from '@/services/language';
import { array2Map } from '@/utils/funcs';
import type { Model } from 'dva';
import type { Effect, Reducer } from 'umi';

type TLangState = {
  dic: Record<string, any>;
  selected?: string;
}

interface ILanguageModel extends Model {
  state: TLangState;
  effects: {
    get: Effect;
  };
  reducers: {
    saveDic: Reducer;
  };
}

const LanguageModel: ILanguageModel = {
  namespace: 'language',
  state: {
    selected: undefined,
    dic: {},
  },
  effects: {
    *get({ payload }, { call, put }) {
      const { callback } = payload || {};
      try {
        const res = yield call(getAllLangs);
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        const { map } = array2Map(res, 'id');
        yield put({
          type: 'saveDic',
          payload: map,
        });
        callback?.(res);
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [LANG/GET]:', err);
        callback?.(false, err);
      }
    },
  },
  reducers: {
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

export default LanguageModel;
