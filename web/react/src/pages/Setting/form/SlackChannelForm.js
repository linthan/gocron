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
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="Channel名称">
          {form.getFieldDecorator('channel', {
            rules: [{ required: true, message: '请输入Channel名称...' }],
          })(<Input placeholder="请输入Channel名称" />)}
        </FormItem>
      </Modal>
    );
  }
}
