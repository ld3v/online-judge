import { create, getAll } from '@/services/notification';
import { array2Map } from '@/utils/funcs';
import type { Model } from 'dva';
import type { Effect, Reducer } from 'umi';

type TNotificationState = {
  dic: Record<string, any>;
  list: any[];
  selected?: string;
  createModalVisible: boolean;
};

interface INotificationModel extends Model {
  state: TNotificationState;
  effects: {
    getAll: Effect;
    create: Effect;
  };
  reducers: {
    select: Reducer;
    saveList: Reducer;
    modalCreateVisible: Reducer;
  };
}

const NotificationModel: INotificationModel = {
  namespace: 'notification',
  state: {
    dic: {},
    list: [],
    selected: undefined,
    createModalVisible: false,
  },
  effects: {
    *getAll({ payload }, { call, put }): Generator<any, any, any> {
      const { callback } = payload || {};
      try {
        const notifications = yield call(getAll);
        if (notifications.isError) {
          callback?.(false);
          return;
        }
        yield put({ type: 'saveList', payload: notifications });
        const { keys } = array2Map(notifications, 'id');
        callback?.(keys);
      } catch (err) {
        console.error('Something went wrong when try to get all notifications for you:', err);
        callback?.(false);
      }
    },
    *create({ payload }, { call, put }): Generator<any, any, any> {
      const { title, text, callback } = payload || {};
      try {
        const res = yield call(create, {
          title,
          text
        });
        if (res.isError) {
          callback?.(false, res);
          return;
        }
        yield put({ type: 'getAll' });
        yield put({ type: 'modalVisible' });
        callback?.(res);
      } catch (err) {
        console.error('[ERROR] - [DISPATCH] - [NOTIFICATION/CREATE]:', err);
        callback?.(false, err);
      }
    },
  },
  reducers: {
    modalCreateVisible(state, { visible }) {
      return {
        ...state,
        createModalVisible: !!visible,
      }
    },
    select(state, { payload }) {
      const { id } = payload || {};
      return {
        ...state,
        selected: id
      };
    },
    saveList(state, { payload }) {
      const { map, keys } = array2Map(payload, "id");
      return {
        ...state,
        dic: {
          ...state.dic,
          ...map,
        },
        list: keys
      };
    },
  },
};

export default NotificationModel;
