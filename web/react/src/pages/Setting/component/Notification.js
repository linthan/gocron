import React, { Component, Fragment } from 'react';
import { Card } from 'antd';

class Notification extends Component {
    render() {
        return <Card bordered={false} style={{ color: "darkgray", marginBottom: 12 }}>
            <code style={{ color: "darkgray" }}>
                <h3>通知模板支持的变量</h3>

                <div>TaskId 任务ID</div>
                <div>  Status 任务执行结果状态</div>
                <div>  Result 任务执行输出</div>
            </code>
        </Card>
    }
}
export default Notification;