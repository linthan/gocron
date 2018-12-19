import React from 'react';
import classNames from 'classnames';
import { Icon, Modal, Row, Button } from 'antd';
import { DashboardModel } from '@/core/dashboard/dashboard_model';
import { PanelModel } from '@/core/dashboard/panel_model';

import appEvents from '@/core/app_events';

export interface DashboardRowProps {
  panel: PanelModel;
  dashboard: DashboardModel;
}

export class DashboardRow extends React.Component<DashboardRowProps, any> {
  constructor(props) {
    super(props);

    this.state = { collapsed: this.props.panel.collapsed, modelVisible: false };

    this.toggle = this.toggle.bind(this);
    this.openSettings = this.openSettings.bind(this);
    this.delete = this.delete.bind(this);
    this.update = this.update.bind(this);
  }

  toggle() {
    this.props.dashboard.toggleRow(this.props.panel);

    this.setState(prevState => {
      return { collapsed: !prevState.collapsed };
    });
  }

  update() {
    this.props.dashboard.processRepeats();
    this.forceUpdate();
  }

  openSettings() {
    appEvents.emit('show-modal', {
      templateHtml: `<row-options row="model.row" on-updated="model.onUpdated()" dismiss="dismiss()"></row-options>`,
      modalClass: 'modal--narrow',
      model: {
        row: this.props.panel,
        onUpdated: this.update.bind(this),
      },
    });
  }

  delete() {
    this.setState({ modalVisible: true });
  }

  render() {
    const { dashboard, panel } = this.props;
    const { modalVisible } = this.state;
    const classes = classNames({
      'dashboard-row': true,
      'dashboard-row--collapsed': this.state.collapsed,
    });
    const chevronClass = classNames({
      fa: true,
      'fa-chevron-down': !this.state.collapsed,
      'fa-chevron-right': this.state.collapsed,
    });

    const title = this.props.panel.title;
    const count = this.props.panel.panels ? this.props.panel.panels.length : 0;
    const panels = count === 1 ? 'panel' : 'panels';
    const canEdit = this.props.dashboard.meta.canEdit === true;

    return (
      <div className={classes}>
        <a className="dashboard-row__title pointer" onClick={this.toggle}>
          <i className={chevronClass} />
          {title}
          <span className="dashboard-row__panel_count">
            ({count} {panels})
          </span>
        </a>
        {canEdit && (
          <div className="dashboard-row__actions">
            <a className="pointer" onClick={this.delete}>
              <Icon type="delete" />
            </a>
          </div>
        )}
        {this.state.collapsed === true && (
          <div className="dashboard-row__toggle-target" onClick={this.toggle}>
            &nbsp;
          </div>
        )}
        {canEdit && <div className="dashboard-row__drag grid-drag-handle" />}
        <Modal
          title={
            <div>
              <Icon style={{ marginRight: 6 }} type="delete" />
              删除面板
            </div>
          }
          visible={modalVisible}
          onCancel={() => {
            this.setState({ modalVisible: false });
          }}
          onOk={() => {
            this.setState({ modalVisible: false });
          }}
          footer={null}
        >
          <Row style={{ marginBottom: 20 }}>
            <h3>删除行并删除所有面板？</h3>
          </Row>
          <Row>
            <Button
              onClick={() => {
                dashboard.removeRow(panel, false);
              }}
              style={{ marginRight: 6 }}
              type="primary"
            >
              只删除行
            </Button>
            <Button
              onClick={() => {
                dashboard.removeRow(panel, true);
              }}
              style={{ marginRight: 6 }}
              type="danger"
            >
              是
            </Button>
            <Button
              onClick={() => {
                this.setState({ modalVisible: false });
              }}
              style={{ marginRight: 6 }}
            >
              否
            </Button>
          </Row>
        </Modal>
      </div>
    );
  }
}
