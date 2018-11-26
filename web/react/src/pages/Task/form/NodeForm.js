import React, { PureComponent } from 'react';

import { Form, Input, InputNumber, Modal, Select, Divider, Alert } from 'antd';
const FormItem = Form.Item;

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
        form.resetFields();
        if (fieldsValue.id === 0) {
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
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="节点名称">
          {form.getFieldDecorator('alias', {
            rules: [{ required: true, message: '请输入节点名称...' }],
          })(<Input placeholder="请输入节点名称" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="主机名">
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入主机名...' }],
          })(<Input placeholder="请输入主机名" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="端口">
          {form.getFieldDecorator('port', {
            rules: [{ required: true, message: '请输入端口...' }],
          })(<InputNumber style={{ width: '100%' }} placeholder="请填写端口" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="备注">
          {form.getFieldDecorator('remark', {})(<TextArea rows={4} />)}
        </FormItem>
      </Modal>
    );
  }
}
