import React, { PureComponent } from 'react';

import { Form, Input, InputNumber, Modal, Radio, Icon, message } from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;

@Form.create()
export default class CreateUpdateForm extends PureComponent {
  componentDidMount() {
    const { form, setForm } = this.props;
    setForm(form);
  }

  render() {
    const {
      formTitle,
      modalVisible,
      form,
      handleAdd,
      handleUpdate,
      handleModalVisible,
    } = this.props;
    const id = form.getFieldValue('id');

    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        if (!id) {
          if (
            fieldsValue.password !== fieldsValue.confirm_password ||
            !fieldsValue.password ||
            !fieldsValue.confirm_password
          ) {
            message.error('密码输入不匹配');
            return;
          }
        }
        const param = {
          ...fieldsValue,
        };
        const data = new FormData();
        Object.keys(param).forEach(key => {
          data.append(key, param[key]);
        });
        form.resetFields();
        if (fieldsValue.id === '') {
          handleAdd(data);
        } else {
          handleUpdate(data);
        }
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
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="用户名">
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入用户名...' }],
          })(<Input placeholder="请输入用户名" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="邮箱">
          {form.getFieldDecorator('email', {
            rules: [{ required: true, message: '请输入邮箱...' }],
          })(<Input placeholder="请输入邮箱" />)}
        </FormItem>
        <FormItem
          style={{ display: !id ? 'block' : 'none' }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="密码"
        >
          {form.getFieldDecorator('password', {})(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="密码"
            />
          )}
        </FormItem>
        <FormItem
          style={{ display: !id ? 'block' : 'none' }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="确认密码"
        >
          {form.getFieldDecorator('confirm_password', {})(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="确认密码"
            />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="角色">
          {form.getFieldDecorator('is_admin', {
            rules: [{ required: true, message: '请选择角色...' }],
          })(
            <RadioGroup>
              <Radio value={0}>普通用户</Radio>
              <Radio value={1}>管理员</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="状态">
          {form.getFieldDecorator('status', {
            rules: [{ required: true, message: '请选择状态...' }],
          })(
            <RadioGroup>
              <Radio value={1}>启用</Radio>
              <Radio value={0}>禁用</Radio>
            </RadioGroup>
          )}
        </FormItem>
      </Modal>
    );
  }
}
