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
  Switch,
  Popconfirm,
} from 'antd';
import StandardTable from '@/components/BizTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './User.less';
import { runStatusList, protocolList } from './constant';
import CreateUpdateForm from './form/UserForm';
import PasswordForm from './form/PasswordForm';
export const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const createTitle = '新建';
const updateTile = '编辑';
@connect(({ user, loading }) => ({
  user,
  loading: loading.effects['user/fetch'],
}))
@Form.create()
class Manage extends PureComponent {
  state = {
    formTitle: createTitle,
    modalVisible: false,
    passwdModalVisible: false,
    formValues: {},
    pagination: {},
  };

  columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'name',
    },
    {
      title: '邮件箱',
      dataIndex: 'email',
    },
    {
      title: '角色',
      dataIndex: 'is_admin',
      render: val => {
        if (val === 1) {
          return '管理员';
        }
        return '普通用户';
      },
    },
    {
      title: '配置权限',
      render: (val, record) => {
        return (
          <Button
            onClick={() => {
              router.push(`/setting/pms/${record.id}`);
            }}
            style={{
              marginRight: 6,
              color: '#fff',
              backgroundColor: '#409eff',
              borderColor: '#409eff',
            }}
          >
            配置权限
          </Button>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (val, record) => {
        return (
          <Switch
            checked={!!val}
            onChange={checked => {
              const { dispatch } = this.props;
              if (checked) {
                dispatch({
                  type: 'user/enableUser',
                  payload: { id: record.id },
                  callback: () => {
                    dispatch({
                      type: 'user/fetch',
                      payload: this.getParam(),
                    });
                  },
                });
              } else {
                dispatch({
                  type: 'user/disableUser',
                  payload: { id: record.id },
                  callback: () => {
                    dispatch({
                      type: 'user/fetch',
                      payload: this.getParam(),
                    });
                  },
                });
              }
            }}
          />
        );
      },
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
                this.changePass(record);
              }}
              style={{
                marginRight: 6,
                color: '#fff',
                backgroundColor: '#67c23a',
                borderColor: '#67c23a',
              }}
            >
              修改密码
            </Button>
            <Popconfirm
              placement="topLeft"
              title={'确定删除？'}
              onConfirm={() => {
                this.remove(record);
              }}
              okText="确定"
              cancelText="取消"
            >
              <Button
                onClick={() => {}}
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
      type: 'user/fetch',
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
      type: 'user/fetch',
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
      type: 'user/fetch',
      payload: this.getParam(),
    });
  };
  add = () => {
    this.form.setFieldsValue({
      id: '',
      name: '',
      email: '',
      is_admin: 0,
      status: 0,
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
      email: item.email,
      is_admin: item.is_admin,
      status: item.status,
    });
    this.setState({
      formTitle: updateTile,
    });
    this.handleModalVisible(true);
  };

  remove = record => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/remove',
      payload: { id: record.id },
      callback: () => {
        dispatch({
          type: 'user/fetch',
          payload: this.getParam(),
        });
      },
    });
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/storeUser',
      payload: fields,
      callback: () => {
        dispatch({
          type: 'user/fetch',
          payload: this.getParam(),
        });
      },
    });
    this.handleModalVisible(false);
  };

  changePass = record => {
    this.passForm.setFieldsValue({
      id: record.id,
    });
    this.handlePassModalVisible(true);
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/storeUser',
      payload: fields,
      callback: () => {
        dispatch({
          type: 'user/fetch',
          payload: this.getParam(),
        });
      },
    });
    this.handleModalVisible(false);
  };

  handlePassUpdate = (fields, id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/changePass',
      payload: fields,
      id,
    });
    this.handlePassModalVisible(false);
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
        type: 'user/fetch',
        payload: { ...values },
      });
    });
  };

  setForm = form => {
    this.form = form;
  };

  setPassForm = form => {
    this.passForm = form;
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handlePassModalVisible = flag => {
    this.setState({
      passwdModalVisible: !!flag,
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
    const { user = {}, loading } = this.props;
    const { data = {} } = user;
    const { modalVisible, formTitle, passwdModalVisible } = this.state;
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleUpdate: this.handleUpdate,
      setForm: this.setForm,
      handleModalVisible: this.handleModalVisible,
    };

    const passParentMethods = {
      handlePassUpdate: this.handlePassUpdate,
      setForm: this.setPassForm,
      handleModalVisible: this.handlePassModalVisible,
    };
    return (
      <PageHeaderWrapper title="用户管理">
        <Card bordered={false}>
          <div className={styles.tableList}>
            {/* <div className={styles.tableListForm}>{this.renderForm()}</div> */}
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
        <PasswordForm
          formTitle={'更改密码'}
          {...passParentMethods}
          modalVisible={passwdModalVisible}
        />
      </PageHeaderWrapper>
    );
  }
}

export default Manage;
