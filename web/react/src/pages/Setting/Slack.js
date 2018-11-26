import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Card, Select, InputNumber, Input, Icon, Row, Col, Button, Tag, Divider } from 'antd';
import styles from './Email.less';
import Notification from './component/Notification';
import CreateForm from './form/SlackChannelForm';
const { Option } = Select;
const FormItem = Form.Item;
const { TextArea } = Input;
const pageSize = 5;

@connect(({ slack, loading }) => ({
  slack,
  loading: loading.models.slack,
}))
@Form.create()
class Slack extends Component {
  state = {
    slack: {},
    modalVisible: false,
    channels: [],
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
        type: 'slack/update',
        payload: data,
      });
    });
  };

  componentDidMount() {
    this.fetchSlack();
  }

  fetchSlack = () => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'slack/fetch',
      payload: {},
      callback: item => {
        form.setFieldsValue({
          url: item.url,
          template: item.template,
        });
        this.setState({ channels: item.channels });
      },
    });
  };
  setForm = form => {
    this.form = form;
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'slack/storeChannel',
      payload: fields,
      callback: () => {
        this.fetchSlack();
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
          <Col md={12} sm={24}>
            <FormItem label="Slack Webhook URL">
              {getFieldDecorator('url', {
                rules: [{ required: true, message: '请输入Slack Webhook URL...' }],
              })(<Input placeholder="请输入Slack Webhook URL" />)}
            </FormItem>
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
                    type: 'slack/remove',
                    payload: item,
                    callback: () => {
                      this.fetchSlack();
                    },
                  });
                }}
              >{`${item.name}`}</Tag>
            );
          })}
      </div>
    );
  };
  render() {
    const { modalVisible, channels } = this.state;
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
          <h2>Channel</h2>
          <Divider type="horizontal" />
          <Button
            type="primary"
            style={{ marginRight: 6, marginBottom: 12 }}
            onClick={() => {
              this.handleModalVisible(true);
            }}
          >
            新增Channel
          </Button>
          {this.renderTag(channels)}
        </Card>
        <CreateForm formTitle="新增邮件用户" {...parentMethods} modalVisible={modalVisible} />
      </Fragment>
    );
  }
}

export default Slack;
