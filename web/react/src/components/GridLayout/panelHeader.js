import React, { PureComponent } from 'react';
import classNames from 'classnames';

export class PanelHeader extends PureComponent {
  render() {
    const { panel } = this.props;
    const isFullscreen = false;
    const panelHeaderClass = classNames({
      'panel-header': true,
      'grid-drag-handle': !isFullscreen,
    });

    return (
      <div className={panelHeaderClass}>
        <div className="panel-title-container">
          <div className="panel-title">
            <span className="panel-title-text" data-toggle="dropdown">
              {panel.title} <span className="fa fa-caret-down panel-menu-toggle" />
            </span>
          </div>
        </div>
      </div>
    );
  }
}
