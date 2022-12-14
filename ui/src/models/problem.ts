import { createProblem, deleteProblemById, getAllProblems, getProblemById, updateProblem } from '@/services/problem';
import { TModelState } from '@/types';
import { array2Map } from '@/utils/funcs';
import type { Model } from 'dva';
import type { Effect, Reducer } from 'umi';

interface IProblemModel extends Model {
  state: TModelState;
  effects: {
    search: Effect;
    create: Effect;
    update: Effect;
    getById: Effect;
    deleteById: Effect;
  };
  reducers: {
    saveCurrent: Reducer;
    saveDic: Reducer;
    saveDicTmp: Reducer;
    removeById: Reducer;
  };
}

const ProblemModel: IProblemModel = {
  namespace: 'problem',
  state: {
    current: undefined,
    dic: {},
    list: [],
  },
  effects: {
    *search({ payload }, { call, put }): Generator<any, any, any> {
      const { keyword, assignmentIds, langIds, except, page, limit, callback } = payload || {};
      try {
        const res = yield call(getAllProblems, { keyword, assignmentIds, langIds, except, page, limit });
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
        console.error('[ERROR] - [DISPATCH] - [PROBLEM/SEARCH]:', keyword, err);
        callback?.(false, err);
      }
    },
    *create({ payload }, { call, put }): Generator<any, any, any> {
      const { data, callback } = payload || {};
      try {
        const res = yield call(createProblem, data);
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
        console.error('[ERROR] - [DISPATCH] - [PROBLEM/CREATE]:', data, err);
        callback?.(false, err);
      }
    },
    *update({ payload }, { call, put }): Generator<any, any, any> {
      const { id, data, callback } = payload || {};
      try {
        const res = yield call(updateProblem, id, data);
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
        console.error('[ERROR] - [DISPATCH] - [PROBLEM/UPDATE]:', data, err);
        callback?.(false, err);
      }
    },
    *getById({ payload }, { call, put }): Generator<any, any, any> {
      const { id, callback } = payload || {};
      try {
        const res = yield call(getProblemById, id);
        if (res.isError) {
          callback?.(false, res);
          return res;
        }
        yield put({
          type: 'saveCurrent',
          payload: res,
        })
        callback?.(res);
        return res;
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [PROBLEM/GET-BY-ID]:', id, err);
        callback?.(false, err);
        return { isError: true, messageId: 'exception.problem.getById.unknown' }
      }
    },
    *deleteById({ payload }, { call, put }): Generator<any, any, any> {
      const { id, callback } = payload || {};
      try {
        const res = yield call(deleteProblemById, id);
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        yield put({
          type: 'removeById',
          payload: id,
        })
        callback?.(res);
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [PROBLEM/DELETE-BY-ID]:', id, err);
        callback?.(false, err);
      }
    }
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
    saveDicTmp(state, { payload }) {
      const dataNeedUpdate = {};
      const ids = Object.keys(payload);
      ids.forEach(id => {
        dataNeedUpdate[id] = state.dic[id]
          ? { ...state.dic[id], ...payload[id] }
          : payload[id];
      });
      return {
        ...state,
        dic: {
          ...state.dic,
          ...dataNeedUpdate,
        },
      };
    },
    removeById(state, { payload }) {
      return {
        ...state,
        dic: {
          ...state.dic,
          [payload]: undefined,
        },
      };
    },
  },
};

export default ProblemModel;
