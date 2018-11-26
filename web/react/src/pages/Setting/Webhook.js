import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Card, InputNumber, Input, Icon, Row, Col, Button, Tag, Divider } from 'antd';
import styles from './Email.less';
import Notification from './component/Notification';
import CreateForm from './form/EmailUserForm';
const FormItem = Form.Item;
const { TextArea } = Input;

@connect(({ emailconfig, loading }) => ({
  emailconfig,
  loading: loading.models.emailconfig,
}))
@Form.create()
class Email extends Component {
  state = {
    webhook: {},
    modalVisible: false,
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
        type: 'webhook/update',
        payload: data,
        callback: () => {
          this.fetchWebhook();
        },
      });
    });
  };

  componentDidMount() {
    this.fetchWebhook();
  }

  fetchWebhook = () => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'webhook/fetch',
      payload: {},
      callback: item => {
        form.setFieldsValue({
          url: item.url,
          template: item.template,
        });
      },
    });
  };
  setForm = form => {
    this.form = form;
  };

  renderForm = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handSubmit} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }} style={{ marginBottom: 6 }}>
          <Col md={12} sm={24}>
            <code style={{ color: 'darkgray' }}>
              通知内容推送到指定URL, POST请求, 设置Header[ Content-Type: application/json]
            </code>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="URL">
              {getFieldDecorator('url', {
                rules: [{ required: true, message: '请输入URL...' }],
              })(<Input placeholder="请输入URL" />)}
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

  render() {
    const { modalVisible } = this.state;
    return (
      <Fragment>
        <Notification />
        <Card style={{ marginBottom: 12 }}>
          <div className={styles.tableListForm}>{this.renderForm()}</div>
        </Card>
      </Fragment>
    );
  }
}

export default Email;
