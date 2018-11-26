import { message } from 'antd';
import { email } from '@/services/crontask';
import { fetch, update, remove } from '@/services/webhook';
import check from '@/utils/check';
export default {
  namespace: 'webhook',
  state: {
    mail: {},
  },
  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(fetch, payload);
      if (check(response)) {
        yield put({
          type: 'saveWebhook',
          payload: response.data,
        });
        if (callback) callback(response.data);
      }
    },
    *update({ payload }, { call }) {
      const response = yield call(update, payload);
      if (check(response)) {
        message.success(response.message ? response.message : '操作成功');
      }
    },
  },

  reducers: {
    saveWebhook(state, action) {
      return {
        ...state,
        webhook: action.payload || {},
      };
    },
  },
};
