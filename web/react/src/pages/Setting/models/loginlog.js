import { message } from 'antd';
import { queryLog } from '@/services/loginlog';
import check from '@/utils/check';
export default {
  namespace: 'loginlog',
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
