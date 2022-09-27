import { getSubmission } from '@/services/submission';
import { array2Map } from '@/utils/funcs';
import type { Model } from 'dva';
import type { Effect, Reducer } from 'umi';

type TSubmission = {
  dic: Record<string, any>;
  current?: string;
};

interface ISubmissionModel extends Model {
  state: TSubmission;
  effects: {
    search: Effect;
  };
  reducers: {
    saveCurrent: Reducer;
    saveDic: Reducer;
  };
}

const SubmissionModel: ISubmissionModel = {
  namespace: 'submission',
  state: {
    current: undefined,
    dic: {},
  },
  effects: {
    *search({ payload }, { call, put }): Generator<any, any, any> {
      const { assignmentId, accountId, problemId, langId, page, limit, callback } = payload || {};
      try {
        const res = yield call(getSubmission, { assignmentId, accountId, problemId, langId, page, limit });
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        if (res.assignment) {
          yield put({
            type: 'assignments/saveSelected',
            payload: res.assignment,
          })
        }
        const { map, keys } = array2Map(res.data, 'id');
        yield put({
          type: 'saveDic',
          payload: map,
        });
        if (res)
          callback?.({ keys, total: res.total });
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [SUBMISSION/SEARCH]:', err);
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

export default SubmissionModel;
