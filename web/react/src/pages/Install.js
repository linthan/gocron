import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Form,
  Card,
  Select,
  InputNumber,
  Input,
  Icon,
  Row,
  Col,
  Button,
  Tag,
  Divider,
  message,
} from 'antd';
import styles from './Install.less';
const { Option } = Select;
const FormItem = Form.Item;

@connect(({ install, loading }) => ({
  install,
  submitting: loading.effects['install/store'],
}))
@Form.create()
class Install extends Component {
  state = {};
  handSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const param = { ...fieldsValue };

      if (
        !param.admin_password ||
        !param.confirm_admin_password ||
        param.admin_password !== param.confirm_admin_password
      ) {
        message.error('密码输入不匹配');
        return;
      }
      // 防止db_table_prefix为undefined
      param.db_table_prefix = param.db_table_prefix ? param.db_table_prefix : '';
      const data = new FormData();
      Object.keys(param).forEach(key => {
        data.append(key, param[key]);
      });

      dispatch({
        type: 'install/store',
        payload: data,
        callback: () => {
          form.resetFields();
        },
      });
    });
  };

  renderForm = () => {
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handSubmit} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <h2>数据库配置</h2>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="数据库">
              {getFieldDecorator('db_type', {
                rules: [{ required: true, message: '请选择数据库...' }],
              })(
                <Select style={{ width: '100%' }} placeholder="请选择数据库">
                  <Option value={'mysql'}>MySql</Option>
                  <Option value={'postgres'}>PostgreSql</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="主机名">
              {getFieldDecorator('db_host', {
                rules: [{ required: true, message: '请输入主机名...' }],
              })(<Input placeholder="请输入主机名" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="端口">
              {getFieldDecorator('db_port', {
                rules: [{ required: true, message: '请输入端口...' }],
              })(<InputNumber min={1} style={{ width: '100%' }} placeholder="请输入端口" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="用户名">
              {getFieldDecorator('db_username', {
                rules: [{ required: true, message: '请输入用户名...' }],
              })(<Input placeholder="请输入用户名" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="密码">
              {getFieldDecorator('db_password', {
                rules: [{ required: true, message: '请输入用户名...' }],
              })(
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  placeholder="请输入密码"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="数据库名称">
              {getFieldDecorator('db_name', {
                rules: [{ required: true, message: '请输入数据库名称...' }],
              })(<Input placeholder="如果数据库不存在，需要提前创建" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="表前缀">
              {getFieldDecorator('db_table_prefix', {})(<Input placeholder="请输入表前缀" />)}
            </FormItem>
          </Col>
        </Row>
        <Divider type="horizontal" />
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <h2>管理员账号配置</h2>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="账号">
              {getFieldDecorator('admin_username', {
                rules: [{ required: true, message: '请输入账号...' }],
              })(<Input placeholder="请输入账号" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="邮箱">
              {getFieldDecorator('admin_email', {
                rules: [
                  { required: true, message: '请输入邮箱...' },
                  { type: 'email', message: '请输入合法的邮箱地址...' },
                ],
              })(
                <Input
                  prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="mail"
                  placeholder="请输入邮箱"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="密码">
              {getFieldDecorator('admin_password', {
                rules: [{ required: true, message: '请输入用户名...' }],
              })(
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  placeholder="请输入密码"
                />
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="确认密码">
              {getFieldDecorator('confirm_admin_password', {
                rules: [{ required: true, message: '请输入确认密码...' }],
              })(
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  placeholder="请输入确认密码"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <span className={styles.submitButtons}>
              <Button loading={submitting} type="primary" htmlType="submit">
                安装
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  render() {
    const { modalVisible, users } = this.state;
    const parentMethods = {
      handleAdd: this.handleAdd,
      setForm: this.setForm,
      handleModalVisible: this.handleModalVisible,
    };
    return (
      <Fragment>
        <Card style={{ marginBottom: 12 }}>
          <div className={styles.tableListForm}>{this.renderForm()}</div>
        </Card>
      </Fragment>
    );
  }
}

export default Install;
