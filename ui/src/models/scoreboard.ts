import { getScoreboard } from '@/services/scoreboard';
import { array2Map } from '@/utils/funcs';
import type { Model } from 'dva';
import type { Effect, Reducer } from 'umi';

type TScoreboardState = {
  dic: Record<string, any>;
  list: any[];
  subColsDic: Record<string, any>;
};

interface IScoreboardModel extends Model {
  state: TScoreboardState;
  effects: {
    get: Effect;
  };
  reducers: {
    saveSubColumnsDic: Reducer;
  };
}

const ScoreboardModel: IScoreboardModel = {
  namespace: 'scoreboard',
  state: {
    dic: {},
    list: [],
    subColsDic: {},
  },
  effects: {
    *get({ payload }, { call, put }): Generator<any, any, any> {
      const { id, callback } = payload || {};
      try {
        const res = yield call(getScoreboard, id);
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        const { data: scoreboardItems, assignment } = res;
        yield put({
          type: 'assignments/saveSelected',
          payload: assignment,
        });

        const subCols = scoreboardItems.map((item: any) => ({
          id: item.id,
          columns: item.submissionColumns,
        }));
        const { map: subColMapping, keys } = array2Map(subCols, 'id');
        yield put({
          type: 'saveSubColumnsDic',
          payload: subColMapping,
        });
        callback?.(keys);
      } catch (err) {
        console.error('Something went wrong when trying to get all of scoreboard item:', err);
        callback?.(false, err);
      }
    },
  },
  reducers: {
    saveSubColumnsDic(state, { payload }) {
      return {
        ...state,
        subColsDic: {
          ...state.subColsDic,
          ...payload,
        },
      };
    },
  },
};

export default ScoreboardModel;
