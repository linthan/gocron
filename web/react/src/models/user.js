import { message } from 'antd';
import {
  query as queryUsers,
  queryCurrent,
  queryUserList,
  enableUser,
  disableUser,
  storeUser,
  changePass,
  remove,
} from '@/services/user';
import check from '@/utils/check';

export default {
  namespace: 'user',

  state: {
    data: {
      data: [],
      total: 0,
    },
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUserList);
      if (check(response)) {
        yield put({
          type: 'save',
          payload: response.data,
        });
      }
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
    *enableUser({ payload, callback }, { call }) {
      const response = yield call(enableUser, payload);
      if (check(response)) {
        message.success(response.message || '操作成功');
        if (callback) callback();
      }
    },
    *disableUser({ payload, callback }, { call }) {
      const response = yield call(disableUser, payload);
      if (check(response)) {
        message.success(response.message || '操作成功');
        if (callback) callback();
      }
    },
    *storeUser({ payload, callback }, { call }) {
      const response = yield call(storeUser, payload);
      if (check(response)) {
        message.success(response.message || '操作成功');
        if (callback) callback();
      }
    },
    *remove({ payload, callback }, { call }) {
      const response = yield call(remove, payload);
      if (check(response)) {
        message.success(response.message || '操作成功');
        if (callback) callback();
      }
    },
    *changePass({ payload, id }, { call }) {
      const response = yield call(changePass, payload, id);
      if (check(response)) {
        message.success(response.message || '操作成功');
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
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
  },
};
