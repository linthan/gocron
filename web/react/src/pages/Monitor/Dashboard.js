import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import GridLayout from 'react-grid-layout';
import { Card, Form } from 'antd';
import classNames from 'classnames';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { DashboardGrid } from '@/components/GridLayout/DashboardGrid';
import router from 'umi/router';
import styles from './Dashboard.less';
import { DashboardModel } from '@/core/dashboard/dashboard_model';

export const FormItem = Form.Item;

@connect(({ monitor, loading }) => ({
  monitor,
  loading: loading.models.monitor,
}))
@Form.create()
class Manage extends PureComponent {
  constructor(props) {
    super(props);
    this.dashboard = new DashboardModel({}, this, { canEdit: true, editable: true });
    this.dashboard.addPanel({
      type: 'pannel',
      title: '教工一楼',
      gridPos: { x: 0, y: 0, h: 8, w: 8 },
    });
    this.dashboard.addPanel({
      type: 'pannel',
      title: '教工二楼',
      gridPos: { x: 0, y: 0, h: 8, w: 8 },
    });
  }
  componentDidMount() {
    // const { dispatch } = this.props;
    // dispatch({ type: 'monitor/initData' });
  }

  render() {
    const { dashboard } = this.props;
    console.log(dashboard);
    const classWrapper = classNames({
      'panel-in-fullscreen': this.dashboard.meta.fullscreen,
      dashboardWrapper: true,
    });
    return (
      <div className={classWrapper} style={{ flex: 'auto', minHeight: 0 }}>
        <div>hah</div>
        <DashboardGrid
          dashboard={this.dashboard}
          getPanelContainer={() => {
            this.dashboard;
          }}
        />
      </div>
    );
  }
}

export default Manage;
