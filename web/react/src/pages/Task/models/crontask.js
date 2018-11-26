import { message } from 'antd';
import {
  queryTask,
  enableTask,
  disableTask,
  allHost,
  email,
  slack,
  storeTask,
  runTask,
  remove,
} from '@/services/crontask';
import check from '@/utils/check';
export default {
  namespace: 'crontask',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    nodes: [],
    mail: {},
    slack: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryTask, payload);
      if (check(response)) {
        yield put({
          type: 'save',
          payload: response.data,
        });
      }
    },
    *enableTask({ payload, callback }, { call }) {
      const response = yield call(enableTask, payload);
      if (check(response)) {
        message.success(response.message || '操作成功');
        if (callback) callback();
      }
    },
    *disableTask({ payload, callback }, { call }) {
      const response = yield call(disableTask, payload);
      if (check(response)) {
        message.success(response.message || '操作成功');
        if (callback) callback();
      }
    },
    *allHost({ payload }, { call, put }) {
      const response = yield call(allHost, payload);
      if (check(response)) {
        yield put({
          type: 'saveHost',
          payload: response.data,
        });
      }
    },
    *email({ payload }, { call, put }) {
      const response = yield call(email, payload);
      if (check(response)) {
        yield put({
          type: 'saveMail',
          payload: response.data,
        });
      }
    },
    *slack({ payload }, { call, put }) {
      const response = yield call(slack, payload);
      if (check(response)) {
        yield put({
          type: 'saveSlack',
          payload: response.data,
        });
      }
    },
    *runTask({ payload }, { call }) {
      const response = yield call(runTask, payload);
      if (check(response)) {
        message.success(response.message || '操作成功');
      }
    },
    *storeTask({ payload, callback }, { call, put }) {
      const response = yield call(storeTask, payload);
      if (check(response)) {
        if (callback) callback();
      }
    },
    *remove({ payload, callback }, { call }) {
      const response = yield call(remove, payload);
      if (check(response)) {
        message.success(response.message ? response.message : '操作成功');
        if (callback) callback();
      }
    },
    *enableTask({ payload, callback }, { call }) {
      const response = yield call(enableTask, payload);
      if (check(response)) {
        message.success(response.message || '操作成功');
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
    saveMail(state, action) {
      return {
        ...state,
        mail: action.payload || [],
      };
    },
    saveSlack(state, action) {
      return {
        ...state,
        slack: action.payload || [],
      };
    },
    saveHost(state, action) {
      return {
        ...state,
        nodes: action.payload || [],
      };
    },
  },
};
