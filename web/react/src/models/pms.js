import check from '@/utils/check';
import { setPmsInfo } from '@/utils/authority';
import { message } from 'antd';
import { report, queryPms, queryOwnPms } from '@/services/pms';

export default {
  namespace: 'pms',

  state: {
    ownPermission: null,
  },

  effects: {
    *report({ payload, callback }, { call, put }) {
      const response = yield call(report, payload);
      if (check(response)) {
        message.success(response.message ? response.message : '操作成功');
        if (callback) callback((response.data && response.data.pms) || []);
      }
    },
    *queryPms({ payload, callback }, { call, put }) {
      const response = yield call(queryPms, payload);
      if (check(response)) {
        if (callback) callback((response.data && response.data.pms) || []);
      }
    },
    *queryOwnPms({ payload, callback }, { call, put }) {
      const response = yield call(queryOwnPms, payload);
      if (check(response)) {
        setPmsInfo((response.data && response.data.pms) || []);
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
    saveOwnPermission(state, action) {
      return { ...state, ownPermission: action.payload };
    },
  },
};
