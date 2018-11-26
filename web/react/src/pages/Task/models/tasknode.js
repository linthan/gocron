import { message } from 'antd';
import { queryHost, ping, storeNode, remove } from '@/services/tasknode';
import check from '@/utils/check';
export default {
  namespace: 'tasknode',
  state: {
    data: {
      data: [],
      total: 0,
    },
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryHost, payload);
      if (check(response)) {
        yield put({
          type: 'save',
          payload: response.data,
        });
      }
    },
    *ping({ payload }, { call }) {
      const response = yield call(ping, payload);
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
    *storeNode({ payload, callback }, { call }) {
      const response = yield call(storeNode, payload);
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
