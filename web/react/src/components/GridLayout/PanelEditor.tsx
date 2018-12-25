import React, { PureComponent } from 'react';
import { Button, Tabs, Input } from 'antd';
const TabPane = Tabs.TabPane;

export class PanelEditor extends PureComponent<any, any> {
  render() {
    const { panel } = this.props;
    const operations = (
      <Button
        onClick={() => {
          this.props.dashboard.setViewMode(this.props.panel, false, false);
        }}
        style={{ marginRight: 6 }}
      >
        Extra Action
      </Button>
    );
    return (
      <div className="panel-editor-container__editor">
        <Tabs style={{ width: '100%' }} tabBarExtraContent={operations}>
          <TabPane tab="Tab 1" key="1">
            <Input
              value={panel.title}
              onChange={e => {
                panel.title = e.target.value;
                this.forceUpdate();
                panel.events.emit('panel-config-changed');
              }}
            />
          </TabPane>
          <TabPane tab="Tab 2" key="2">
            Content of tab 2
          </TabPane>
          <TabPane tab="Tab 3" key="3">
            Content of tab 3
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
