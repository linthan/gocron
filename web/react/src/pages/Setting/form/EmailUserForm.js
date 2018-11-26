import React, { PureComponent } from 'react';

import { Form, Input, InputNumber, Modal, Radio, Icon, message } from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;

@Form.create()
export default class CreateForm extends PureComponent {
  componentDidMount() {
    const { form, setForm } = this.props;
    setForm(form);
  }

  render() {
    const { formTitle, modalVisible, form, handleAdd, handleModalVisible } = this.props;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        const param = {
          ...fieldsValue,
        };
        const data = new FormData();
        Object.keys(param).forEach(key => {
          data.append(key, param[key]);
        });
        handleAdd(data);
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
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="用户名">
          {form.getFieldDecorator('username', {
            rules: [{ required: true, message: '请输入用户名...' }],
          })(<Input placeholder="请输入用户名" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="邮箱地址">
          {form.getFieldDecorator('email', {
            rules: [
              { required: true, message: '请输入邮箱地址...' },
              { type: 'email', message: '请输入合法的邮箱地址...' },
            ],
          })(
            <Input
              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="mail"
              placeholder="邮箱地址"
            />
          )}
        </FormItem>
      </Modal>
    );
  }
}
