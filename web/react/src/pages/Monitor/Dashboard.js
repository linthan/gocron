import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import GridLayout from 'react-grid-layout';
import { Card, Form } from 'antd';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
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
          <GridLayout className="layout" cols={12} rowHeight={30} width={1200}>
            <div key="a" data-grid={{ x: 0, y: 0, w: 1, h: 2, static: true }}>
              a
            </div>
            <div key="b" data-grid={{ x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 }}>
              b
            </div>
            <div key="c" data-grid={{ x: 4, y: 0, w: 1, h: 2 }}>
              c
            </div>
          </GridLayout>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Manage;
