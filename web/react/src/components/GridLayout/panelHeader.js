import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { Menu, Dropdown, Icon } from 'antd';

export class PanelHeader extends PureComponent {
  state = { fullScreen: false };
  render() {
    const { panel, dashboard } = this.props;
    const isFullscreen = false;
    const panelHeaderClass = classNames({
      'panel-header': true,
      'grid-drag-handle': !isFullscreen,
    });
    const menuStyle = {
      width: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    };
    const menu = (
      <Menu>
        <Menu.Item>
          <a
            onClick={() => {
              // console.log(dashboard);
              dashboard.setViewMode(panel, true, false);
            }}
            style={menuStyle}
          >
            查看 <Icon type="eye" />
          </a>
        </Menu.Item>
        <Menu.Item>
          <a
            onClick={() => {
              dashboard.setViewMode(panel, false, false);
            }}
            style={menuStyle}
          >
            编辑 <Icon type="edit" />
          </a>
        </Menu.Item>
        <Menu.Item>
          <a style={menuStyle}>
            <span>删除</span> <Icon type="delete" />
          </a>
        </Menu.Item>
      </Menu>
    );

    return (
      <div className={panelHeaderClass}>
        <div className="panel-title-container">
          <div className="panel-title">
            <span className="panel-title-text">
              <Dropdown overlayClassName="panel-menu" overlay={menu}>
                <a className="ant-dropdown-link">
                  {panel.title} <Icon type="down" />
                </a>
              </Dropdown>
            </span>
          </div>
        </div>
      </div>
    );
  }
}
