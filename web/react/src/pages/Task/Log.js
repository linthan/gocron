import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';

import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Menu,
  InputNumber,
  message,
  Badge,
  Divider,
  Modal,
  Popconfirm,
} from 'antd';
import StandardTable from '@/components/BizTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from 'umi/router';
import styles from './Log.less';
import { runStatusList, protocolList, protocolMap, runStatusMap } from './constant';

export const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

@connect(({ tasklog, loading }) => ({
  tasklog,
  loading: loading.effects['tasklog/fetch'],
}))
@Form.create()
class Manage extends PureComponent {
  state = {
    modalVisible: false,
    formValues: {},
    pagination: {},
    currentTaskResult: {},
  };

  showTaskResult = record => {
    this.setState({
      currentTaskResult: { result: record.result, command: record.command },
      modalVisible: true,
    });
  };
  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '任务ID',
      dataIndex: 'task_id',
    },
    {
      title: '任务名称',
      dataIndex: 'name',
    },
    {
      title: '执行方式',
      dataIndex: 'protocol',
      render: val => {
        return protocolMap[val] ? protocolMap[val] : val;
      },
    },
    {
      title: '任务节点',
      dataIndex: 'hostname',
      render: val => {
        return (
          val &&
          val.split('<br>').map(item => {
            return <div key={item}>{item}</div>;
          })
        );
      },
    },
    {
      title: '执行时长',
      render: (text, record) => {
        return (
          <div>
            <div>执行时长: {record.total_time > 0 ? record.total_time : 1}秒</div>
            <div> 开始时间: {moment(record.start_time).format('YYYY-MM-DD HH:mm:ss')}</div>
            <div> 结束时间: {moment(record.end_time).format('YYYY-MM-DD HH:mm:ss')}</div>
          </div>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: '8%',
      render: val => {
        switch (val) {
          case 0:
            return <Badge status="error" text="失败" />;
          case 1:
            return <Badge status="processing" text="执行中" />;
          case 2:
            return <Badge status="success" text="成功" />;
          case 3:
            return <Badge status="warning" text="取消" />;
        }
        return val;
      },
    },
    {
      title: '操作',
      render: (text, record) => {
        return (
          <Fragment>
            {record.status === 2 ? (
              <Button
                onClick={() => {
                  this.showTaskResult(record);
                }}
                style={{ marginRight: 6 }}
                type="primary"
                icon="check"
              >
                查看结果
              </Button>
            ) : record.status == 0 ? (
              <Button
                onClick={() => {
                  this.showTaskResult(record);
                }}
                style={{
                  marginRight: 6,
                  backgroundColor: '#e6a23c',
                  borderColor: '#e6a23c',
                }}
                icon="warning"
              >
                查看结果
              </Button>
            ) : null}
            {record.status === 1 && record.protocol === 2 ? (
              <Button type="danger">停止任务</Button>
            ) : null}
          </Fragment>
        );
      },
    },
  ];

  getSearch = () => {
    const { location } = this.props;
    const { search = '' } = location;
    const paramsString = (search && search.substring(1)) || '';
    const searchParams = new URLSearchParams(paramsString);
    return searchParams;
  };
  componentDidMount() {
    const { dispatch, form } = this.props;
    const search = this.getSearch();
    const task_id = search.get('task_id');
    if (task_id) {
      form.setFieldsValue({ task_id: parseInt(task_id, 10) });
    }
    dispatch({
      type: 'tasklog/fetch',
      payload: this.getParam(),
    });
  }

  getParam = () => {
    const { formValues, pagination = {} } = this.state;
    const search = this.getSearch();
    const task_id = search.get('task_id');
    let params = {
      page: pagination.current || 1,
      page_size: pagination.pageSize || 20,
    };
    if (task_id) {
      params['task_id'] = parseInt(task_id, 10);
    }
    params = { ...params, ...formValues };
    return params;
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});
    this.setState({ pagination });
    const params = {
      page: pagination.current,
      page_size: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'tasklog/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'tasklog/fetch',
      payload: {},
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });
      dispatch({
        type: 'tasklog/fetch',
        payload: { ...values },
      });
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  renderForm = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={4} sm={24}>
            <FormItem label="任务ID">
              {getFieldDecorator('task_id')(
                <InputNumber style={{ width: '100%' }} placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="执行方式">
              {getFieldDecorator('protocol')(
                <Select style={{ width: '100%' }} placeholder="执行方式">
                  {protocolList.map(item => {
                    return (
                      <Option key={item[0]} value={item[0]}>
                        {item[1]}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('status')(
                <Select style={{ width: '100%' }} placeholder="状态">
                  {runStatusList.map(item => {
                    return (
                      <Option key={item[0]} value={item[0]}>
                        {item[1]}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  };

  render() {
    const { tasklog = {}, loading, dispatch } = this.props;
    const { data = {} } = tasklog;
    const { modalVisible, currentTaskResult } = this.state;

    return (
      <PageHeaderWrapper title="任务日志">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Popconfirm
                title="确定执行此操作?"
                onConfirm={() => {
                  console.log('clear');
                  dispatch({
                    type: 'tasklog/cleanLog',
                    callback: () => {
                      dispatch({
                        type: 'tasklog/fetch',
                        payload: this.getParam(),
                      });
                    },
                  });
                }}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
              >
                <Button icon="close" type="danger">
                  清空日志
                </Button>
              </Popconfirm>
            </div>
            <StandardTable
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <Modal
          width={720}
          title="任务执行结果"
          onOk={() => {
            this.handleModalVisible(false);
          }}
          onCancel={() => this.handleModalVisible(false)}
          visible={modalVisible}
        >
          {' '}
          <div>
            <pre className={styles.taskResult}>{currentTaskResult.command}</pre>
          </div>
          <div>
            <pre className={styles.taskResult}>{currentTaskResult.result}</pre>
          </div>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default Manage;
