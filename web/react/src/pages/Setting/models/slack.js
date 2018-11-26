import { message } from 'antd';
import { storeChannel, update, remove, fetch } from '@/services/slack';
import check from '@/utils/check';
export default {
  namespace: 'slack',
  state: {
    slack: {},
  },
  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(fetch, payload);
      if (check(response)) {
        yield put({
          type: 'saveSlack',
          payload: response.data,
        });
        if (callback) callback(response.data);
      }
    },
    *storeChannel({ payload, callback }, { call }) {
      const response = yield call(storeChannel, payload);
      if (check(response)) {
        message.success(response.message ? response.message : '操作成功');
        if (callback) callback();
      }
    },
    *update({ payload }, { call }) {
      const response = yield call(update, payload);
      if (check(response)) {
        message.success(response.message ? response.message : '操作成功');
      }
    },
    *remove({ payload, callback }, { call }) {
      const response = yield call(remove, payload);
      if (check(response)) {
        message.success(response.message ? response.message : '操作成功');
        if (callback) callback();
      }
    },
  },

  reducers: {
    saveSlack(state, action) {
      return {
        ...state,
        slack: action.payload || {},
      };
    },
  },
};
