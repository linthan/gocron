import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, InputNumber, Modal, Select, Divider, Alert } from 'antd';
import {
  taskTypeList,
  depTypeList,
  protocolList,
  httpMethodList,
  runInstanceTypeList,
  notifyStatusTypeList,
  notifyTypeList,
} from '../constant';
const { Option } = Select;
const FormItem = Form.Item;

const { TextArea } = Input;
@connect(({ crontask }) => ({
  crontask,
}))
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
      crontask: { nodes = [], mail = {}, slack = {} },
    } = this.props;
    const mailUsers = mail.mail_users || [];
    const channels = slack.channels || [];
    const taskLevel = form.getFieldValue('level');
    const taskProtocol = form.getFieldValue('protocol');
    const notifyStatus = form.getFieldValue('notify_status');
    const notifyType = form.getFieldValue('notify_type');
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        const notify_receiver_id = fieldsValue.notify_receiver_id || [];
        const host_id = fieldsValue.host_id || [];
        const param = {
          ...fieldsValue,
          notify_receiver_id: notify_receiver_id.join(','),
          host_id: host_id.join(','),
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
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="任务名称">
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入任务名称...' }],
          })(<Input placeholder="请输入任务名称" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="标签">
          {form.getFieldDecorator('tag', {})(<Input placeholder="请填写标签" />)}
        </FormItem>
        <Divider type="horizontal" />
        <Alert
          message="任务配置须知"
          description={
            <div>
              <span>
                主任务可以配置多个子任务, 当主任务执行完成后，自动执行子任务 任务类型新增后不能变更
              </span>
              <br />
              <span>
                强依赖: 主任务执行成功，才会运行子任务 弱依赖:
                无论主任务执行是否成功，都会运行子任务
              </span>
            </div>
          }
          type="warning"
          style={{ marginBottom: 12 }}
        />
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="任务类型">
          {form.getFieldDecorator('level', {
            rules: [{ required: true, message: '请选择任务类型...' }],
          })(
            <Select placeholder={'请选择任务类型'} style={{ width: '100%' }}>
              {taskTypeList.map(item => {
                return (
                  <Option key={item[0]} value={item[0]}>
                    {item[1]}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem
          style={{ display: taskLevel && taskLevel === 1 ? 'block' : 'none' }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="依赖关系"
        >
          {form.getFieldDecorator('dependency_status', {})(
            <Select placeholder={'请选择依赖关系'} style={{ width: '100%' }}>
              {depTypeList.map(item => {
                return (
                  <Option key={item[0]} value={item[0]}>
                    {item[1]}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem
          style={{ display: taskLevel && taskLevel === 1 ? 'block' : 'none' }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="子任务ID"
        >
          {form.getFieldDecorator('dependency_task_id', {})(<Input placeholder="多个ID逗号分割" />)}
        </FormItem>
        <FormItem
          style={{ display: taskLevel && taskLevel === 1 ? 'block' : 'none' }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="crontab"
        >
          {form.getFieldDecorator('spec', {})(<Input placeholder="秒 分 时 天 月 周" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="执行方式">
          {form.getFieldDecorator('protocol', {
            rules: [{ required: true, message: '请选择执行方式...' }],
          })(
            <Select placeholder="请选择执行方式" style={{ width: '100%' }}>
              {protocolList.map(item => {
                return (
                  <Option key={item[0]} value={item[0]}>
                    {item[1]}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem
          style={{ display: taskProtocol && taskProtocol === 2 ? 'block' : 'none' }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="任务节点"
        >
          {form.getFieldDecorator('host_id', {
            rules: [{ required: true, message: '请选择任务节点...' }],
          })(
            <Select mode="multiple" style={{ width: '100%' }} placeholder="任务节点">
              {nodes.map(item => {
                return (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem
          style={{ display: taskProtocol && taskProtocol === 1 ? 'block' : 'none' }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="请求方法"
        >
          {form.getFieldDecorator('http_method', {
            rules: [{ required: true, message: '请选择执行方式...' }],
          })(
            <Select placeholder="请选择执行方式" style={{ width: '100%' }}>
              {httpMethodList.map(item => {
                return (
                  <Option key={item[0]} value={item[0]}>
                    {item[1]}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="命令">
          {form.getFieldDecorator('command', {
            rules: [{ required: true, message: '请输入命令...' }],
          })(
            <TextArea
              rows={4}
              placeholder={taskProtocol === 1 ? '请输入url地址' : '请输入shell命令'}
            />
          )}
        </FormItem>
        <Divider type="horizontal" />
        <Alert
          message="任务运行须知"
          description={
            <div>
              <span>任务执行超时强制结束, 取值0-86400(秒), 默认0, 不限制</span>
              <br />
              <span>
                单实例运行, 前次任务未执行完成，下次任务调度时间到了是否要执行,
                即是否允许多进程执行同一任务
              </span>
            </div>
          }
          type="warning"
          style={{ marginBottom: 12 }}
        />
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="任务超时">
          {form.getFieldDecorator('timeout', {
            rules: [{ required: true, message: '请输入任务超时间...' }],
          })(<InputNumber min={0} style={{ width: '100%' }} placeholder="请输入任务超时间" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="单实例运行">
          {form.getFieldDecorator('multi', {
            rules: [{ required: true, message: '请选择是否单实例运行...' }],
          })(
            <Select placeholder="请选择是否单实例运行" style={{ width: '100%' }}>
              {runInstanceTypeList.map(item => {
                return (
                  <Option key={item[0]} value={item[0]}>
                    {item[1]}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="重试次数">
          {form.getFieldDecorator('retry_times', {
            rules: [{ required: true, message: '请输入重试次数...' }],
          })(<InputNumber min={0} style={{ width: '100%' }} placeholder="请输入重试次数" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="重试间隔">
          {form.getFieldDecorator('retry_interval', {
            rules: [{ required: true, message: '请输入重试间隔...' }],
          })(<InputNumber min={0} style={{ width: '100%' }} placeholder="请输入重试间隔" />)}
        </FormItem>
        <Divider type="horizontal" />
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="任务通知">
          {form.getFieldDecorator('notify_status', {
            rules: [{ required: true, message: '请选择是任务通知规则...' }],
          })(
            <Select placeholder="请选择是任务通知规则" style={{ width: '100%' }}>
              {notifyStatusTypeList.map(item => {
                return (
                  <Option key={item[0]} value={item[0]}>
                    {item[1]}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem
          style={{ display: notifyStatus && notifyStatus !== 1 ? 'block' : 'none' }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="通知类型"
        >
          {form.getFieldDecorator('notify_type', {})(
            <Select
              onChange={() => {
                form.setFieldsValue({ notify_receiver_id: [] });
              }}
              placeholder="请选择任务通知类型"
              style={{ width: '100%' }}
            >
              {notifyTypeList.map(item => {
                return (
                  <Option key={item[0]} value={item[0]}>
                    {item[1]}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem
          style={{
            display: notifyStatus !== 1 && notifyType && notifyType !== 4 ? 'block' : 'none',
          }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label={notifyType === 2 ? '接收用户' : notifyType === 3 ? '发送Channel' : '错误'}
        >
          {form.getFieldDecorator('notify_receiver_id', {})(
            <Select mode="multiple" style={{ width: '100%' }} placeholder="请选择">
              {notifyType === 2
                ? mailUsers.map(item => {
                    return (
                      <Option key={item.id} value={item.id}>
                        {item.username}
                      </Option>
                    );
                  })
                : notifyType === 3
                  ? channels.map(item => {
                      return (
                        <Option key={item.id} value={item.id}>
                          {item.name}
                        </Option>
                      );
                    })
                  : null}
            </Select>
          )}
        </FormItem>
        <FormItem
          style={{ display: notifyStatus === 4 ? 'block' : 'none' }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="任务输出关键字"
        >
          {form.getFieldDecorator('notify_keyword', {})(<Input placeholder="请填写标签" />)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="备注">
          {form.getFieldDecorator('remark', {})(<TextArea rows={4} />)}
        </FormItem>
      </Modal>
    );
  }
}
