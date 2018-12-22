import React, { Component } from 'react';
import classNames from 'classnames';

// import PanelHeaderCorner from './PanelHeaderCorner';
import { PanelHeaderMenu } from './PanelHeaderMenu';

import { DashboardModel } from '@/core/dashboard/dashboard_model';
import { PanelModel } from '@/core/dashboard/panel_model';
import { ClickOutsideWrapper } from '@/components/grafana/ClickOutsideWrapper/ClickOutsideWrapper';

export interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
  title?: string;
  description?: string;
  scopedVars?: string;
  links?: [];
}

interface State {
  panelMenuOpen: boolean;
}

export class PanelHeader extends Component<Props, State> {
  state = {
    panelMenuOpen: false,
  };

  onMenuToggle = event => {
    event.stopPropagation();

    this.setState(prevState => ({
      panelMenuOpen: !prevState.panelMenuOpen,
    }));
  };

  closeMenu = () => {
    this.setState({
      panelMenuOpen: false,
    });
  };

  render() {
    const isFullscreen = false;
    const isLoading = false;
    const panelHeaderClass = classNames({
      'panel-header': true,
      'grid-drag-handle': !isFullscreen,
    });
    const { panel, dashboard } = this.props;
    return (
      <>
        <div className={panelHeaderClass}>
          {isLoading && (
            <span className="panel-loading">
              <i className="fa fa-spinner fa-spin" />
            </span>
          )}
          <div className="panel-title-container" onClick={this.onMenuToggle}>
            <div className="panel-title">
              <span className="icon-gf panel-alert-icon" />
              <span className="panel-title-text">
                {panel.title} <span className="fa fa-caret-down panel-menu-toggle" />
              </span>

              {this.state.panelMenuOpen && (
                <ClickOutsideWrapper onClick={this.closeMenu}>
                  <PanelHeaderMenu panel={panel} dashboard={dashboard} />
                </ClickOutsideWrapper>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}
