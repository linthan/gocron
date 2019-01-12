import React, { PureComponent } from 'react';

import { Form, Input, InputNumber, Modal, Select, Divider, Alert, Icon } from 'antd';
const FormItem = Form.Item;
import styles from './EscalationForm.less';

import EscalationInput from './EscalationInput';
const { TextArea } = Input;

@Form.create()
export default class CreateUpdateForm extends PureComponent {
  state = {};
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
        className={styles.alertEscalationPolicyModal}
        style={{ width: 900, left: -250 }}
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
        <div>
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入任务名称...' }],
          })(<EscalationInput />)}
        </div>
      </Modal>
    );
  }
}
