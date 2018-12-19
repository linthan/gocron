import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import Highlighter from 'react-highlight-words';
import { DashboardModel } from '../../core/dashboard/dashboard_model';
import { PanelModel } from '../../core/dashboard/panel_model';
import ScrollBar from '../../components/ScrollBar/ScrollBar';

export interface AddPanelPanelProps {
  panel: PanelModel;
  dashboard: DashboardModel;
}

export class AddPanelPanel extends React.Component<AddPanelPanelProps, any> {
  private scrollbar: ScrollBar;
  constructor(props) {
    super(props);
    this.handleCloseAddPanel = this.handleCloseAddPanel.bind(this);
    this.renderPanelItem = this.renderPanelItem.bind(this);
    this.panelSizeChanged = this.panelSizeChanged.bind(this);

    this.state = {
      // panelPlugins: this.getPanelPlugins(''),
      // copiedPanelPlugins: this.getCopiedPanelPlugins(''),
      filter: '',
      tab: 'Add',
    };
  }
  componentDidMount() {
    this.props.panel.events.on('panel-size-changed', this.panelSizeChanged);
  }
  panelSizeChanged() {
    setTimeout(() => {
      this.scrollbar.update();
    });
  }
  handleCloseAddPanel(evt) {
    evt.preventDefault();
    this.props.dashboard.removePanel(this.props.dashboard.panels[0]);
  }
  renderText(text: string) {
    const searchWords = this.state.filter.split('');
    return (
      <Highlighter
        highlightClassName="highlight-search-match"
        textToHighlight={text}
        searchWords={searchWords}
      />
    );
  }

  renderPanelItem(panel, index) {
    return (
      <div
        key={index}
        className="add-panel__item"
        onClick={() => this.onAddPanel(panel)}
        title={panel.name}
      >
        <img className="add-panel__item-img" src={panel.info.logos.small} />
        <div className="add-panel__item-name">{this.renderText(panel.name)}</div>
      </div>
    );
  }
  openCopy() {
    this.setState({
      tab: 'Copy',
      filter: '',
      // panelPlugins: this.getPanelPlugins(''),
      // copiedPanelPlugins: this.getCopiedPanelPlugins(''),
    });
  }

  openAdd() {
    this.setState({
      tab: 'Add',
      filter: '',
      // panelPlugins: this.getPanelPlugins(''),
      // copiedPanelPlugins: this.getCopiedPanelPlugins(''),
    });
  }
  onAddPanel = panelPluginInfo => {
    const dashboard = this.props.dashboard;
    const { gridPos } = this.props.panel;

    const newPanel: any = {
      type: panelPluginInfo.id,
      title: 'Panel Title',
      gridPos: { x: gridPos.x, y: gridPos.y, w: gridPos.w, h: gridPos.h },
    };

    if (panelPluginInfo.id === 'row') {
      newPanel.title = 'Row title';
      newPanel.gridPos = { x: 0, y: 0 };
    }

    dashboard.addPanel(newPanel);
    dashboard.removePanel(this.props.panel);
  };

  filterChange(evt) {
    this.setState({
      filter: evt.target.value,
      // panelPlugins: this.getPanelPlugins(evt.target.value),
      // copiedPanelPlugins: this.getCopiedPanelPlugins(evt.target.value),
    });
  }
  render() {
    const addClass = classNames({
      'active active--panel': this.state.tab === 'Add',
      '': this.state.tab === 'Copy',
    });

    const copyClass = classNames({
      '': this.state.tab === 'Add',
      'active active--panel': this.state.tab === 'Copy',
    });

    let panelTab;

    // if (this.state.tab === 'Add') {
    //   panelTab = this.state.panelPlugins.map(this.renderPanelItem);
    // } else if (this.state.tab === 'Copy') {
    //   if (this.state.copiedPanelPlugins.length > 0) {
    //     panelTab = this.state.copiedPanelPlugins.map(this.renderPanelItem);
    //   } else {
    //     panelTab = this.noCopiedPanelPlugins();
    //   }
    // }

    return (
      <div className="panel-container add-panel-container">
        <div className="add-panel">
          <div className="add-panel__header">
            <i className="gicon gicon-add-panel" />
            <span className="add-panel__title">New Panel</span>
            <ul className="gf-tabs">
              <li className="gf-tabs-item">
                <div
                  className={'gf-tabs-link pointer ' + addClass}
                  onClick={this.openAdd.bind(this)}
                >
                  Add
                </div>
              </li>
              <li className="gf-tabs-item">
                <div
                  className={'gf-tabs-link pointer ' + copyClass}
                  onClick={this.openCopy.bind(this)}
                >
                  Paste
                </div>
              </li>
            </ul>
            <button className="add-panel__close" onClick={this.handleCloseAddPanel}>
              <i className="fa fa-close" />
            </button>
          </div>
          <ScrollBar ref={element => (this.scrollbar = element)} className="add-panel__items">
            <div className="add-panel__searchbar">
              <label className="gf-form gf-form--grow gf-form--has-input-icon">
                <input
                  type="text"
                  autoFocus
                  className="gf-form-input gf-form--grow"
                  placeholder="Panel Search Filter"
                  value={this.state.filter}
                  onChange={this.filterChange.bind(this)}
                  // onKeyPress={this.filterKeyPress.bind(this)}
                />
                <i className="gf-form-input-icon fa fa-search" />
              </label>
            </div>
            {panelTab}
          </ScrollBar>
        </div>
      </div>
    );
  }
}
