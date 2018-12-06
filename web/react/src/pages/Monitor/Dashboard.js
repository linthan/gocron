import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import GridLayout from 'react-grid-layout';
import { Card, Form } from 'antd';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { DashboardGrid } from '@/components/GridLayout';
import router from 'umi/router';
import styles from './Dashboard.less';

export const FormItem = Form.Item;

@connect(({ crontask, loading }) => ({
  crontask,
  loading: loading.models.crontask,
}))
@Form.create()
class Manage extends PureComponent {
  state = {};

  render() {
    return (
      <PageHeaderWrapper title="监控管理">
        <Card bordered={false}>
          <DashboardGrid
            dashboard={{
              meta: {
                canEdit: true,
              },
              panels: [
                {
                  id: 1,
                  title: '教工一楼',
                  type: 'pannel',
                  gridPos: { x: 0, y: 0, w: 5, h: 5 },
                  resizeDone: () => {},
                  updateGridPos: newPos => {
                    let sizeChanged = false;

                    if (this.gridPos.w !== newPos.w || this.gridPos.h !== newPos.h) {
                      sizeChanged = true;
                    }

                    this.gridPos.x = newPos.x;
                    this.gridPos.y = newPos.y;
                    this.gridPos.w = newPos.w;
                    this.gridPos.h = newPos.h;

                    if (sizeChanged) {
                      // this.events.emit('panel-size-changed');
                    }
                  },
                },
                {
                  id: 2,
                  title: '教工2楼',
                  type: 'pannel',
                  gridPos: { x: 0, y: 0, w: 5, h: 5 },
                  resizeDone: () => {},
                  updateGridPos: newPos => {
                    let sizeChanged = false;

                    if (this.gridPos.w !== newPos.w || this.gridPos.h !== newPos.h) {
                      sizeChanged = true;
                    }

                    this.gridPos.x = newPos.x;
                    this.gridPos.y = newPos.y;
                    this.gridPos.w = newPos.w;
                    this.gridPos.h = newPos.h;

                    if (sizeChanged) {
                      // this.events.emit('panel-size-changed');
                    }
                  },
                },
              ],
            }}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Manage;
