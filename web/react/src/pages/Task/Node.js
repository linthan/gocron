import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
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
import styles from './Node.less';
import { runStatusList, protocolList } from './constant';
import CreateUpdateForm from './form/NodeForm';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const createTitle = '新建';
const updateTile = '编辑';
@connect(({ tasknode, loading }) => ({
  tasknode,
  loading: loading.effects['tasknode/fetch'],
}))
@Form.create()
class Manage extends PureComponent {
  state = {
    formTitle: createTitle,
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    pagination: {},
    stepFormValues: {},
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
      title: '节点ID',
      dataIndex: 'id',
    },
    {
      title: '节点名称',
      dataIndex: 'alias',
    },
    {
      title: '主机名',
      dataIndex: 'name',
    },
    {
      title: '端口',
      dataIndex: 'port',
    },
    {
      title: '查看任务',
      render: (val, record) => {
        return (<Button
          onClick={() => {
            router.push(`/task/manage?host_id=${record.id}`)
          }}
          style={{
            marginRight: 6,
            color: '#fff',
            backgroundColor: '#409eff',
            borderColor: '#409eff',
          }}
        >
          查看任务
          </Button>);
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
    },
    {
      title: '操作',
      render: (text, record) => {
        return (
          <Fragment>
            <Button
              onClick={() => {
                this.update(record);
              }}
              style={{
                marginRight: 6,
                color: '#fff',
                backgroundColor: '#409eff',
                borderColor: '#409eff',
              }}
            >
              编辑
            </Button>
            <Button
              onClick={() => {
                this.ping(record);
              }}
              style={{
                marginRight: 6,
                color: '#fff',
                backgroundColor: '#909399',
                borderColor: '#909399',
              }}
            >
              测试连接
            </Button>
            <Popconfirm placement="topLeft" title={'确定删除？'} onConfirm={() => {
              this.remove(record);
            }} okText="确定" cancelText="取消">
              <Button
                onClick={() => { }}
                style={{
                  marginRight: 6,
                  color: '#fff',
                  backgroundColor: '#f78989',
                  borderColor: '#f78989',
                }}
              >
                删除
              </Button>
            </Popconfirm>
          </Fragment>
        );
      },
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'tasknode/fetch',
      payload: this.getParam(),
    });
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
      type: 'tasknode/fetch',
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
      type: 'tasknode/fetch',
      payload: this.getParam(),
    });
  };
  add = () => {
    this.form.setFieldsValue({
      id: '',
      name: '',
      alias: '',
      port: 5920,
      remark: '',
    });
    this.setState({
      formTitle: createTitle,
    });
    this.handleModalVisible(true);
  };

  update = item => {
    this.form.setFieldsValue({
      id: item.id,
      name: item.name,
      alias: item.alias,
      port: item.port,
      remark: item.remark,
    });
    this.setState({
      formTitle: updateTile,
    });
    this.handleModalVisible(true);
  };

  remove = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tasknode/remove',
      payload: { id: record.id },
      callback: () => {
        dispatch({
          type: 'tasknode/fetch',
          payload: this.getParam(),
        });
      },
    });
  };


  handleAdd = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tasknode/storeNode',
      payload: fields,
      callback: () => {
        dispatch({
          type: 'tasknode/fetch',
          payload: this.getParam(),
        });
      },
    });
    this.handleModalVisible(false);
  };

  ping = record => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tasknode/ping',
      payload: { id: record.id },
    });
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tasknode/storeNode',
      payload: fields,
      callback: () => {
        dispatch({
          type: 'tasknode/fetch',
          payload: this.getParam(),
        });
      },
    });
    this.handleModalVisible(false);
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
      dispatch({
        type: 'tasknode/fetch',
        payload: { ...values },
      });
    });
  };

  setForm = form => {
    this.form = form;
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
            <FormItem label="节点ID">
              {getFieldDecorator('id')(<InputNumber min={1} style={{ width: '100%' }} placeholder="请输入" />)}
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
    const { tasknode = {}, loading, dispatch } = this.props;
    const { data = {} } = tasknode;
    const { modalVisible, formTitle } = this.state;
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleUpdate: this.handleUpdate,
      setForm: this.setForm,
      handleModalVisible: this.handleModalVisible,
    };
    return (
      <PageHeaderWrapper title="任务日志">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button
                icon="plus"
                type="primary"
                onClick={() => {
                  this.add();
                }}
              >
                {createTitle}
              </Button>
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
        <CreateUpdateForm formTitle={formTitle} {...parentMethods} modalVisible={modalVisible} />
      </PageHeaderWrapper>
    );
  }
}

export default Manage;
