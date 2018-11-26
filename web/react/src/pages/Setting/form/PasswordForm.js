import React, { PureComponent } from 'react';

import { Form, Input, InputNumber, Modal, Icon, message } from 'antd';
const FormItem = Form.Item;

@Form.create()
export default class CreateUpdateForm extends PureComponent {
  componentDidMount() {
    const { form, setForm } = this.props;
    setForm(form);
  }

  render() {
    const { modalVisible, form, formTitle, handlePassUpdate, handleModalVisible } = this.props;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        const id = fieldsValue.id;
        if (!id) {
          message.error('发生错误');
          return;
        }
        if (fieldsValue.new_password !== fieldsValue.confirm_new_password) {
          message.error('密码输入不匹配');
          return;
        }
        const data = new FormData();
        data.append('new_password', fieldsValue.new_password);
        data.append('confirm_new_password', fieldsValue.confirm_new_password);
        form.resetFields();
        handlePassUpdate(data, id);
      });
    };
    return (
      <Modal
        width={720}
        title={
          <span>
            <span style={{ fontWeight: 700, color: 'rgba(0, 0, 0, 0.647058823529412)' }}>
              {formTitle}
            </span>
          </span>
        }
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleModalVisible()}
      >
        <FormItem
          style={{ display: 'none' }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="id"
        >
          {form.getFieldDecorator('id', {})(<InputNumber placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="新密码">
          {form.getFieldDecorator('new_password', {
            rules: [{ required: true, message: '请输入新密码...' }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="新密码"
            />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="确认新密码">
          {form.getFieldDecorator('confirm_new_password', {
            rules: [{ required: true, message: '请输入确认新密码..' }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="确认新密码"
            />
          )}
        </FormItem>
      </Modal>
    );
  }
}
