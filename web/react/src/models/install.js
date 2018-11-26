import { message } from 'antd';
import { routerRedux } from 'dva/router';
import { store } from '@/services/install';
import check from '@/utils/check';
export default {
  namespace: 'install',
  state: {
    mail: {},
  },
  effects: {
    *store({ payload, callback }, { call, put }) {
      const response = yield call(store, payload);
      if (check(response)) {
        message.success(response.message ? response.message : '操作成功');
        yield put(routerRedux.push('/'));
        if (callback) callback();
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload || {},
      };
    },
  },
};
