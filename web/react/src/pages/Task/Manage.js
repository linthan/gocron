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
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  message,
  Badge,
  Divider,
  Steps,
  Radio,
  Switch,
  Popconfirm,
} from 'antd';
import StandardTable from '@/components/BizTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from 'umi/router';
import CreateUpdateForm from './form/ManageForm';
import styles from './Manage.less';
import { cronMethoList, statusList } from './constant';

export const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
export const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const createTitle = '新建';
const updateTile = '编辑';
@connect(({ crontask, loading }) => ({
  crontask,
  loading: loading.models.crontask,
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
  };

  columns = [
    {
      title: '任务ID',
      dataIndex: 'id',
    },
    {
      title: '任务名称',
      dataIndex: 'name',
    },
    {
      title: '标签',
      dataIndex: 'tag',
    },
    {
      title: 'cron表达式',
      dataIndex: 'spec',
    },
    {
      title: '下次执行时间',
      dataIndex: 'next_run_time',
      width: '16%',
      render: (val, record) => {
        if (!!record.status) {
          return <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>;
        }
        return null;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (val, record) => {
        return (
          record.level === 1 && (
            <Switch
              checked={!!val}
              onChange={checked => {
                const { dispatch } = this.props;
                if (checked) {
                  dispatch({
                    type: 'crontask/enableTask',
                    payload: { id: record.id },
                    callback: () => {
                      dispatch({
                        type: 'crontask/fetch',
                        payload: this.getParam(),
                      });
                    },
                  });
                } else {
                  dispatch({
                    type: 'crontask/disableTask',
                    payload: { id: record.id },
                    callback: () => {
                      dispatch({
                        type: 'crontask/fetch',
                        payload: this.getParam(),
                      });
                    },
                  });
                }
              }}
            />
          )
        );
      },
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <a
            onClick={() => {
              this.update(record);
            }}
          >
            编辑
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              this.runTask(record);
            }}
          >
            手动执行
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              router.push(`/task/log?task_id=${record.id}`);
            }}
          >
            查看日志
          </a>
          <Divider type="vertical" />

          <Popconfirm
            placement="topLeft"
            title={'确定删除？'}
            onConfirm={() => {
              this.remove(record);
            }}
            okText="确定"
            cancelText="取消"
          >
            <a>删除</a>
          </Popconfirm>
        </Fragment>
      ),
    },
  ];

  getSearch = () => {
    const { location } = this.props;
    const { search = '' } = location;
    const paramsString = (search && search.substring(1)) || '';
    const searchParams = new URLSearchParams(paramsString);
    return searchParams;
  };
  componentWillMount() {
    const search = this.getSearch();
    const host_id = search.get('host_id');
    if (host_id) {
      this.setState({ expandForm: true });
    }
  }
  componentDidMount() {
    const { dispatch, form } = this.props;
    const search = this.getSearch();
    const host_id = search.get('host_id');
    if (host_id) {
      form.setFieldsValue({
        host_id: parseInt(host_id, 10),
      });
    }
    dispatch({
      type: 'crontask/fetch',
      payload: this.getParam(),
    });
    dispatch({
      type: 'crontask/allHost',
    });
    dispatch({ type: 'crontask/email' });
    dispatch({ type: 'crontask/slack' });
  }

  getParam = () => {
    const { formValues, pagination = {} } = this.state;
    const search = this.getSearch();
    const host_id = search.get('host_id');
    let params = {
      page: pagination.current || 1,
      page_size: pagination.pageSize || 20,
    };
    if (host_id) {
      params['host_id'] = parseInt(host_id, 10);
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
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'crontask/fetch',
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
      type: 'crontask/fetch',
      payload: {},
    });
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  remove = record => {
    const { dispatch } = this.props;
    dispatch({
      type: 'crontask/remove',
      payload: { id: record.id },
      callback: () => {
        dispatch({ type: 'crontask/fetch', payload: this.getParam() });
      },
    });
  };
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.setState({ formValues: fieldsValue });

      dispatch({
        type: 'crontask/fetch',
        payload: { ...this.getParam(), ...fieldsValue },
      });
    });
  };
  add = () => {
    this.form.setFieldsValue({
      id: '',
      name: '',
      tag: '',
      level: 1,
      dependency_status: 1,
      dependency_task_id: '',
      spec: '',
      protocol: 2,
      http_method: 1,
      command: '',
      timeout: 0,
      multi: 2,
      host_id: [],
      notify_status: 1,
      notify_type: 2,
      notify_receiver_id: [],
      notify_keyword: '',
      retry_times: 0,
      retry_interval: 0,
      remark: '',
    });
    this.setState({
      formTitle: createTitle,
    });
    this.handleModalVisible(true);
  };

  runTask = item => {
    const { dispatch } = this.props;
    dispatch({
      type: 'crontask/runTask',
      payload: { id: item.id },
    });
  };

  update = item => {
    this.setState({
      formTitle: updateTile,
    });
    const hosts = item.hosts || [];
    const notify_receiver_id = item.notify_receiver_id || '';
    this.form.setFieldsValue({
      id: item.id,
      name: item.name,
      tag: item.tag,
      level: item.level,
      dependency_status: item.dependency_status,
      dependency_task_id: item.dependency_task_id,
      spec: item.spec,
      protocol: item.protocol,
      http_method: item.http_method,
      command: item.command,
      timeout: item.timeout,
      multi: item.multi ? 1 : 2,
      host_id: hosts.map(item => {
        return item.host_id;
      }),
      notify_status: item.notify_status + 1,
      notify_type: item.notify_type + 1,
      notify_receiver_id: notify_receiver_id
        .split(',')
        .map(item => {
          return parseFloat(item, 10);
        })
        .filter(item => {
          return item && item !== 0;
        }),
      notify_keyword: item.notify_keyword,
      retry_times: item.retry_times,
      retry_interval: item.retry_interval,
      remark: item.remark,
    });
    this.handleModalVisible(true);
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    const { formValues, pagination } = this.state;
    dispatch({
      type: 'crontask/storeTask',
      payload: fields,
      callback: () => {
        dispatch({
          type: 'crontask/fetch',
          payload: this.getParam(),
        });
      },
    });
    this.handleModalVisible(false);
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    const { formValues, pagination } = this.state;
    dispatch({
      type: 'crontask/storeTask',
      payload: fields,
      callback: () => {
        dispatch({
          type: 'crontask/fetch',
          payload: this.getParam(),
        });
      },
    });
    this.handleModalVisible(false);
  };

  setForm = form => {
    this.form = form;
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="任务ID">
              {getFieldDecorator('id')(
                <InputNumber style={{ width: '100%' }} placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="任务名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
      crontask: { nodes = [] },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="任务ID">
              {getFieldDecorator('id')(
                <InputNumber style={{ width: '100%' }} placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="任务名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="标签">
              {getFieldDecorator('tag')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="执行方式">
              {getFieldDecorator('protocol')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {cronMethoList.map(item => {
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
          <Col md={8} sm={24}>
            <FormItem label="任务节点">
              {getFieldDecorator('host_id')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {nodes.map(item => {
                    return (
                      <Option key={item.id} value={item.id}>{`${item.alias}-${item.name}:${
                        item.port
                      }`}</Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {statusList.map(item => {
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
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </div>
        </div>
      </Form>
    );
  }

  renderForm() {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  render() {
    const { crontask = {}, loading } = this.props;
    const { data = {} } = crontask;
    const { selectedRows, modalVisible, formTitle, stepFormValues } = this.state;
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleUpdate: this.handleUpdate,
      setForm: this.setForm,
      handleModalVisible: this.handleModalVisible,
    };
    return (
      <PageHeaderWrapper title="定时任务">
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
              {selectedRows.length > 0 && (
                <span>
                  <Button>批量操作</Button>
                  <Dropdown overlay={menu}>
                    <Button>
                      更多操作 <Icon type="down" />
                    </Button>
                  </Dropdown>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
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
