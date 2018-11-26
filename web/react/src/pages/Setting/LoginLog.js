import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input, Button, InputNumber, Switch, Popconfirm } from 'antd';
import moment from 'moment';
import StandardTable from '@/components/BizTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './LoginLog.less';

export const FormItem = Form.Item;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const createTitle = '新建';
const updateTile = '编辑';
@connect(({ loginlog, loading }) => ({
  loginlog,
  loading: loading.effects['loginlog/fetch'],
}))
@Form.create()
class Manage extends PureComponent {
  state = {
    formValues: {},
    pagination: {},
  };

  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '登录IP',
      dataIndex: 'ip',
    },
    {
      title: '登录时间',
      dataIndex: 'created',
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'loginlog/fetch', payload: this.getParam() });
  }
  getParam = () => {
    const { formValues, pagination = {} } = this.state;
    const params = {
      page: pagination.current || 1,
      page_size: pagination.pageSize || 20,
      ...formValues,
    };
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
      type: 'loginlog/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({ type: 'loginlog/fetch', payload: this.getParam() });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
      };

      this.setState({
        formValues: values,
      });
      dispatch({ type: 'loginlog/fetch', payload: { ...values } });
    });
  };

  renderForm = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={4} sm={24}>
            <FormItem label="节点ID">
              {getFieldDecorator('id')(
                <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <FormItem label="主机名">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
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
    const { loginlog = {}, loading } = this.props;
    const { data = {} } = loginlog;
    const { modalVisible, formTitle, passwdModalVisible } = this.state;

    return (
      <PageHeaderWrapper title="登录日志">
        <Card bordered={false}>
          <div className={styles.tableList}>
            {/* <div className={styles.tableListForm}>{this.renderForm()}</div> */}
            <StandardTable
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Manage;
