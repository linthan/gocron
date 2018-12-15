import { DashboardModel } from '@/core/dashboard/dashboard_model';

export default {
  namespace: 'monitor',

  state: {
    dashboard: new DashboardModel(),
    change: 1,
  },

  effects: {
    *initData({ payload }, { call, put }) {
      yield put({
        type: 'initData',
        payload: {},
      });
    },
  },

  reducers: {
    initData(state, { payload }) {
      const dashboard = state.dashboard;
      dashboard.addPanel({});
      return {
        ...state,
      };
    },
  },
};
