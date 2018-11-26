import { message } from 'antd';
import { queryLog, cleanLog } from '@/services/tasklog';
import check from '@/utils/check';
export default {
  namespace: 'tasklog',
  state: {
    data: {
      data: [],
      total: 0,
    },
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryLog, payload);
      if (check(response)) {
        yield put({
          type: 'save',
          payload: response.data,
        });
      }
    },
    *cleanLog({ payload, callback }, { call }) {
      const response = yield call(cleanLog, payload);
      if (check(response)) {
        message.success(response.message ? response.message : '操作成功');
        if (callback) callback();
      }
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
