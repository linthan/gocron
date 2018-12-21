import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { DashboardModel } from '@/core/dashboard/dashboard_model';
import { PanelModel } from '@/core/dashboard/panel_model';
// import { PanelHeader } from './PanelHeader/PanelHeader';
import { DashboardRow } from './DashboardRow';
import { AddPanelPanel } from './AddPanelPanel';
import { PanelChrome } from './PanelChrome';
import { AngularComponent } from './AngularLoader';
import { PanelResizer } from './PanelResizer';

// tslint:disable-next-line:interface-name
export interface DashboardPanelProps {
  panel: PanelModel;
  dashboard: DashboardModel;
  isEditing: boolean;
  isFullscreen: boolean;
}
export class DashboardPanel extends PureComponent<DashboardPanelProps, any> {
  angularPanel: AngularComponent;
  element: any;
  specialPanels = {};
  pluginInfo: any;
  //   public dashboard: DashboardModel;
  constructor(props) {
    super(props);

    this.state = {
      pluginExports: null,
    };
    this.specialPanels['row'] = this.renderRow.bind(this);
    this.specialPanels['add-panel'] = this.renderAddPanel.bind(this);
    this.state = { pluginExports: null };
  }
  public componentDidMount() {
    this.loadPlugin();
  }
  isSpecial() {
    return this.specialPanels[this.props.panel.type];
  }
  renderRow() {
    return <DashboardRow panel={this.props.panel} dashboard={this.props.dashboard} />;
  }
  renderAddPanel() {
    return <AddPanelPanel panel={this.props.panel} dashboard={this.props.dashboard} />;
  }

  renderReactPanel() {
    const { dashboard, panel } = this.props;
    const { plugin } = this.state;
    return <PanelChrome plugin={plugin} panel={panel} dashboard={dashboard} />;
  }

  loadPlugin() {
    if (this.isSpecial()) {
      return;
    }
    this.setState({ pluginExports: { PanelComponent: {} } });
  }

  cleanUpAngularPanel() {
    if (this.angularPanel) {
      this.angularPanel.destroy();
      this.angularPanel = null;
    }
  }

  public render() {
    const { panel, dashboard, isFullscreen, isEditing } = this.props;
    // const { plugin, angularPanel } = this.state;
    if (this.isSpecial()) {
      return this.specialPanels[this.props.panel.type]();
    }

    // if we have not loaded plugin exports yet, wait
    // if (!plugin || !plugin.exports) {
    //   return null;
    // }
    const containerClass = classNames({
      'panel-editor-container': isEditing,
      'panel-height-helper': !isEditing,
    });
    const panelWrapperClass = classNames({
      'panel-wrapper': true,
      'panel-wrapper--edit': isEditing,
      'panel-wrapper--view': isFullscreen && !isEditing,
    });

    return (
      <div className={containerClass}>
        <PanelResizer
          isEditing={!!isEditing}
          panel={panel}
          render={(panelHeight: number | 'inherit') => (
            <div
              className={panelWrapperClass}
              // onMouseEnter={this.onMouseEnter}
              // onMouseLeave={this.onMouseLeave}
              style={{ height: panelHeight }}
            >
              {this.renderReactPanel()}
            </div>
          )}
        />
      </div>
    );
  }
}
