import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Card, Select, InputNumber, Input, Icon, Row, Col, Button, Tag, Divider } from 'antd';
import styles from './Email.less';
import Notification from './component/Notification';
import CreateForm from './form/EmailUserForm';
const { Option } = Select;
const FormItem = Form.Item;
const { TextArea } = Input;
const pageSize = 5;

@connect(({ email, loading }) => ({
  email,
  loading: loading.models.email,
}))
@Form.create()
class Email extends Component {
  state = {
    mail: {},
    modalVisible: false,
    users: [],
  };

  handSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const param = {
        ...fieldsValue,
      };
      const data = new FormData();
      Object.keys(param).forEach(key => {
        data.append(key, param[key]);
      });
      dispatch({
        type: 'email/update',
        payload: data,
      });
    });
  };

  componentDidMount() {
    this.fetchEmail();
  }

  fetchEmail = () => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'email/fetch',
      payload: {},
      callback: item => {
        form.setFieldsValue({
          host: item.host,
          port: item.port,
          user: item.user,
          password: item.password,
          template: item.template,
        });
        this.setState({
          users: item.mail_users,
        });
      },
    });
  };
  setForm = form => {
    this.form = form;
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'email/storeEmailUser',
      payload: fields,
      callback: () => {
        this.fetchEmail();
        this.form.resetFields();
      },
    });
    this.handleModalVisible(false);
  };

  renderForm = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handSubmit} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="SMTP服务器">
              {getFieldDecorator('host', {
                rules: [{ required: true, message: '请输入SMTP服务器...' }],
              })(<Input min={1} style={{ width: '100%' }} placeholder="请输入SMTP服务器" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="端口">
              {getFieldDecorator('port', {
                rules: [{ required: true, message: '请输入端口...' }],
              })(<InputNumber min={1} style={{ width: '100%' }} placeholder="请输入端口" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="用户名">
              {getFieldDecorator('user', {
                rules: [{ required: true, message: '请输入用户名...' }],
              })(<Input placeholder="请输入用户名" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="密码">
              {getFieldDecorator('password', {
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
        <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ marginBottom: 6 }}>
          <Col md={12} sm={24}>
            <code style={{ color: 'darkgray' }}>通知模板支持html</code>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="模板">
              {getFieldDecorator('template', {
                rules: [{ required: true, message: '请输入模板...' }],
              })(<TextArea rows={8} placeholder="请输入模板" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                保存
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

  renderTag = items => {
    const { dispatch } = this.props;
    return (
      <div>
        {items &&
          items.map(item => {
            return (
              <Tag
                style={{ margin: 6 }}
                key={item.id}
                closable
                onClose={() => {
                  dispatch({
                    type: 'email/remove',
                    payload: item,
                    callback: () => {
                      this.fetchEmail();
                    },
                  });
                }}
              >{`${item.username}-${item.email}`}</Tag>
            );
          })}
      </div>
    );
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
        <Notification />
        <Card style={{ marginBottom: 12 }}>
          <div className={styles.tableListForm}>{this.renderForm()}</div>
        </Card>
        <Card>
          <h2>通知用户</h2>
          <Divider type="horizontal" />
          <Button
            type="primary"
            style={{ marginRight: 6, marginBottom: 12 }}
            onClick={() => {
              this.handleModalVisible(true);
            }}
          >
            新增用户
          </Button>
          {this.renderTag(users)}
        </Card>
        <CreateForm formTitle="新增邮件用户" {...parentMethods} modalVisible={modalVisible} />
      </Fragment>
    );
  }
}

export default Email;
