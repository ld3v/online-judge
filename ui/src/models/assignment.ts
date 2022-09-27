import { createAssignment, deleteAssignment, getAllAssignments, getAssignmentById, getAssignmentProblems, getCoefficient, updateAssignment } from '@/services/assignment';
import { TAssignment, TAssignmentProblem } from '@/types/assignment';
import { array2Map } from '@/utils/funcs';
import type { Model } from 'dva';
import type { Effect, Reducer } from 'umi';

const transformAssignmentData = (...assignments: TAssignment[]): { assignmentMapping: Record<string, any>; problemMapping: Record<string, any>; participantMapping: Record<string, any>; submissionMapping: Record<string, any> } => {
  const assignmentMapping = {};
  const problemMapping = {};
  const participantMapping = {};
  const submissionMapping = {};
  assignments.forEach(({ problems, participants, submissions, ...ass }) => {
    const { map: assProblemMapping, keys: assProblemKeys } = array2Map(problems, "id");
    const { map: assParticipantMapping, keys: assParticipantKeys } = array2Map(participants, "id");
    const { map: assSubmissionMapping, keys: assSubmissionKeys } = array2Map(submissions, "id");

    Object.assign(problemMapping, assProblemMapping);
    Object.assign(participantMapping, assParticipantMapping);
    Object.assign(submissionMapping, assSubmissionMapping);

    assignmentMapping[ass.id] = {
      ...ass,
      problems: assProblemKeys,
      participants: assParticipantKeys,
      submissions: assSubmissionKeys,
    };
  });
  return {
    assignmentMapping,
    problemMapping,
    participantMapping,
    submissionMapping,
  };
}

interface IAssignmentModel extends Model {
  state: {
    dic: Record<string, TAssignment>;
    problemDic: Record<string, TAssignmentProblem>;
    selected?: string;
    previewSelected?: string;
  };
  effects: {
    search: Effect;
    create: Effect;
    updateById: Effect;
    getById: Effect;
    getProblems: Effect;
    deleteById: Effect;
    _coefficient: Effect;
  };
  reducers: {
    saveSelected: Reducer;
    setPreviewSelected: Reducer;
    saveDic: Reducer;
    saveDicTmp: Reducer;
    saveProblemDicTmp: Reducer;
    removeById: Reducer;
  };
}

const AssignmentModel: IAssignmentModel = {
  namespace: 'assignments',
  state: {
    selected: undefined,
    previewSelected: undefined,
    dic: {},
    problemDic: {},
  },
  effects: {
    // Test coefficient
    *_coefficient({ payload }, { call }): Generator<any, any, any> {
      const { callback, ...queryData } = payload;
      try {
        const res = yield call(getCoefficient, queryData);
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        callback?.(res);
      } catch (err) {
        console.error('Somethings went wrong when test rule:', err);
        callback?.(false, err);
      }
    },
    *search({ payload }, { call, put }): Generator<any, any, any> {
      const { keyword, except, page, limit, callback } = payload || {};
      try {
        const res = yield call(getAllAssignments, { keyword, except, page, limit });
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        // Reset 'selected' to `undefined`
        const { assignmentMapping, problemMapping, participantMapping, submissionMapping } = transformAssignmentData(...res.data);
        yield put({
          type: 'saveDic',
          payload: assignmentMapping,
        });
        yield put({
          type: 'saveProblemDicTmp',
          payload: problemMapping,
        });
        yield put({
          type: 'account/saveDic',
          payload: participantMapping,
        });
        yield put({
          type: 'submission/saveDic',
          payload: submissionMapping,
        });
        callback?.({ keys: Object.keys(assignmentMapping), total: res.total });
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [ASSIGNMENT/SEARCH]:', keyword, err);
        callback?.(false, err);
      }
    },
    *create({ payload }, { call, put }): Generator<any, any, any> {
      const { data, callback } = payload || {};
      try {
        const res = yield call(createAssignment, data);
        console.log(res);
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        const { assignmentMapping, problemMapping, participantMapping } = transformAssignmentData(res);
        yield put({
          type: 'saveDic',
          payload: assignmentMapping,
        });
        yield put({
          type: 'saveProblemDicTmp',
          payload: problemMapping,
        });
        yield put({
          type: 'account/saveDic',
          payload: participantMapping,
        });
        callback?.(res);
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [ASSIGNMENT/CREATE]:', data, err);
        callback?.(false, err);
      }
    },
    *updateById({ payload }, { call, put }): Generator<any, any, any> {
      const { id, data, callback } = payload || {};
      try {
        const res = yield call(updateAssignment, id, data);
        if (res.isError) {
          callback?.(false, res);
          return;
        }

        const { assignmentMapping, problemMapping, participantMapping, submissionMapping } = transformAssignmentData(res);
        yield put({
          type: 'saveDic',
          payload: assignmentMapping,
        });
        yield put({
          type: 'saveProblemDicTmp',
          payload: problemMapping,
        });
        yield put({
          type: 'account/saveDic',
          payload: participantMapping,
        });
        yield put({
          type: 'submission/saveDic',
          payload: submissionMapping,
        });
        callback?.(res);
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [ASSIGNMENT/UPDATE]:', data, err);
        callback?.(false, err);
      }
    },
    *getById({ payload }, { call, put }): Generator<any, any, any> {
      const { id, callback } = payload || {};
      try {
        const res = yield call(getAssignmentById, id);
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        const { assignmentMapping, problemMapping, participantMapping, submissionMapping } = transformAssignmentData(res);
        yield put({
          type: 'saveSelected',
          payload: assignmentMapping[id],
        });
        yield put({
          type: 'account/updateFieldValue',
          payload: {
            field: 'selectedAssignment',
            value: id,
          }
        });
        yield put({
          type: 'saveProblemDicTmp',
          payload: problemMapping,
        });
        yield put({
          type: 'account/saveDic',
          payload: participantMapping,
        });
        yield put({
          type: 'submission/saveDic',
          payload: submissionMapping,
        });
        callback?.(res);
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [ASSIGNMENT/GET-BY-ID]:', id, err);
        callback?.(false, err);
      }
    },
    *getProblems({ payload }, { call, put }): Generator<any, any, any> {
      const { id, callback } = payload || {};
      try {
        const res = yield call(getAssignmentProblems, id);
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        const { assignmentMapping, participantMapping, submissionMapping } = transformAssignmentData(res.assignment);
        yield put({
          type: 'saveSelected',
          payload: assignmentMapping[id],
        });
        yield put({
          type: 'account/updateFieldValue',
          payload: {
            field: 'selectedAssignment',
            value: id,
          },
        });
        yield put({
          type: 'account/saveDic',
          payload: participantMapping,
        });
        yield put({
          type: 'submission/saveDic',
          payload: submissionMapping,
        });
        const { map: problemDic, keys: problemIds } = array2Map(res.problems, "id");
        yield put({
          type: 'saveProblemDicTmp',
          payload: problemDic,
        });

        callback?.({
          problemIds,
        });
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [ASSIGNMENT/GET-PROBLEMS]:', id, err);
        callback?.(false, err);
      }
    },
    *deleteById({ payload }, { call, put }): Generator<any, any, any> {
      const { id, callback } = payload || {};
      try {
        const res = yield call(deleteAssignment, id);
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
        console.error('[ERROR] - [DISPATCH] - [ASSIGNMENT/DELETE-BY-ID]:', id, err);
        callback?.(false, err);
      }
    },
  },
  reducers: {
    saveSelected(state, { payload }) {
      if (!payload) {
        return {
          ...state,
          selected: undefined,
        };
      }
      const current = state.dic[payload.id] || {};
      return {
        ...state,
        dic: {
          ...state.dic,
          [payload.id]: {
            ...current,
            ...payload
          },
        },
        selected: payload.id,
      };
    },
    setPreviewSelected(state, { payload }) {
      const { id } = payload || {};
      if (!id) {
        return {
          ...state,
          previewSelected: undefined,
          selected: undefined,
        };
      }
      return {
        ...state,
        previewSelected: id,
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
    saveProblemDicTmp(state, { payload }) {
      const dataNeedUpdate = {};
      const ids = Object.keys(payload);
      ids.forEach(id => {
        dataNeedUpdate[id] = state.problemDic[id]
          ? { ...state.problemDic[id], ...payload[id] }
          : payload[id];
      });
      return {
        ...state,
        problemDic: {
          ...state.problemDic,
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
    }
  },
};

export default AssignmentModel;
