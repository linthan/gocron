import { message } from 'antd';
import { storeEmailUser, update, remove, fetch } from '@/services/email';
import check from '@/utils/check';
export default {
  namespace: 'email',
  state: {
    mail: {},
  },
  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(fetch, payload);
      if (check(response)) {
        yield put({
          type: 'saveMail',
          payload: response.data,
        });
        if (callback) callback(response.data);
      }
    },
    *storeEmailUser({ payload, callback }, { call }) {
      const response = yield call(storeEmailUser, payload);
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
    saveMail(state, action) {
      return {
        ...state,
        mail: action.payload || {},
      };
    },
  },
};
