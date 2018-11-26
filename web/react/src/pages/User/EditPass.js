import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { Alert, Row, Col, Button, Form } from 'antd';
import Login from '@/components/Login';
import styles from './EditPass.less';

const { UserName, Password, Submit } = Login;
const FormItem = Form.Item;

const RollBack = ({ className, ...rest }) => {
  const clsString = classNames(styles.submit, className);
  return (
    <FormItem>
      <Button
        onClick={() => {
          router.goBack();
        }}
        size="large"
        className={clsString}
        type="primary"
        {...rest}
      />
    </FormItem>
  );
};

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/editMyPassword'],
}))
class LoginPage extends Component {
  state = {};

  handleSubmit = (err, values) => {
    if (!err) {
      const { dispatch } = this.props;
      const data = new FormData();
      data.append('old_password', values.old_password || '');
      data.append('new_password', values.new_password || '');
      data.append('confirm_new_password', values.confirm_new_password || '');
      dispatch({
        type: 'login/editMyPassword',
        payload: data,
      });
    }
  };

  renderMessage = content => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  render() {
    const { login, submitting } = this.props;
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          <Password
            name="old_password"
            placeholder="原密码"
            onPressEnter={() => this.loginForm.validateFields(this.handleSubmit)}
          />
          <Password
            name="new_password"
            placeholder="新密码"
            onPressEnter={() => this.loginForm.validateFields(this.handleSubmit)}
          />
          <Password
            name="confirm_new_password"
            placeholder="新密码"
            onPressEnter={() => this.loginForm.validateFields(this.handleSubmit)}
          />
          <Row>
            <Col push={3} span={6}>
              <Submit loading={submitting}>保存</Submit>
            </Col>
            <Col push={9} span={6}>
              <RollBack>取消</RollBack>
            </Col>
          </Row>
        </Login>
      </div>
    );
  }
}

export default LoginPage;
