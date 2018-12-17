import classNames from 'classnames';
import React from 'react';
import ReactGridLayout from 'react-grid-layout';
import sizeMe from 'react-sizeme';
import { GRID_CELL_HEIGHT, GRID_CELL_VMARGIN, GRID_COLUMN_COUNT } from '../../core/constants';
import { DashboardModel } from '@/core/dashboard/dashboard_model';
import { PanelModel } from '@/core/dashboard/panel_model';
import { DashboardPanel } from './DashboardPanel';
import { PanelContainer } from './PanelContainer';

let lastGridWidth = 1200;

function GridWrapper({
  size,
  layout,
  onLayoutChange,
  children,
  onDragStop,
  onResize,
  onResizeStop,
  onWidthChange,
  className,
  isResizable,
  isDraggable,
}) {
  if (size.width === 0) {
    console.log('size is zero!');
  }

  const width = size.width > 0 ? size.width : lastGridWidth;
  if (width !== lastGridWidth) {
    onWidthChange();
    lastGridWidth = width;
  }

  return (
    <ReactGridLayout
      width={lastGridWidth}
      className={className}
      isDraggable={isDraggable}
      isResizable={isResizable}
      measureBeforeMount={false}
      containerPadding={[0, 0]}
      useCSSTransforms={true}
      margin={[GRID_CELL_VMARGIN, GRID_CELL_VMARGIN]}
      cols={GRID_COLUMN_COUNT}
      rowHeight={GRID_CELL_HEIGHT}
      draggableHandle=".grid-drag-handle"
      layout={layout}
      onResize={onResize}
      onResizeStop={onResizeStop}
      onDragStop={onDragStop}
      onLayoutChange={onLayoutChange}
    >
      {children}
    </ReactGridLayout>
  );
}

const SizedReactLayoutGrid = sizeMe({ monitorWidth: true })(GridWrapper);

// tslint:disable-next-line:interface-name
export interface DashboardGridProps {
  dashboard: DashboardModel;
}

export class DashboardGrid extends React.Component<DashboardGridProps, any> {
  public gridToPanelMap: any;
  public panelContainer: PanelContainer;
  public dashboard: DashboardModel;
  public panelMap: { [id: string]: PanelModel };

  constructor(props) {
    super(props);
    // this.panelContainer = this.props.getPanelContainer();
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.onWidthChange = this.onWidthChange.bind(this);

    this.state = { animated: false };

    // subscribe to dashboard events
    this.dashboard = this.props.dashboard;
    this.dashboard.on('panel-added', this.triggerForceUpdate.bind(this));
    this.dashboard.on('panel-removed', this.triggerForceUpdate.bind(this));
    this.dashboard.on('repeats-processed', this.triggerForceUpdate.bind(this));
    this.dashboard.on('view-mode-changed', this.triggerForceUpdate.bind(this));
    this.dashboard.on('row-collapsed', this.triggerForceUpdate.bind(this));
    this.dashboard.on('row-expanded', this.triggerForceUpdate.bind(this));
  }

  public buildLayout() {
    const layout = [];
    this.panelMap = {};

    for (const panel of this.dashboard.panels) {
      const stringId = panel.id.toString();
      this.panelMap[stringId] = panel;

      if (!panel.gridPos) {
        console.log('panel without gridpos');
        continue;
      }

      const panelPos: any = {
        i: stringId,
        x: panel.gridPos.x,
        y: panel.gridPos.y,
        w: panel.gridPos.w,
        h: panel.gridPos.h,
      };

      if (panel.type === 'row') {
        panelPos.w = GRID_COLUMN_COUNT;
        panelPos.h = 1;
        panelPos.isResizable = false;
        panelPos.isDraggable = panel.collapsed;
      }

      layout.push(panelPos);
    }

    return layout;
  }

  public onLayoutChange(newLayout) {
    if (!this.dashboard.meta.fullscreen) {
      for (const newPos of newLayout) {
        this.panelMap[newPos.i].updateGridPos(newPos);
      }
      console.log('layout', this.buildLayout());
      this.dashboard.sortPanelsByGridPos();
    }
  }

  public triggerForceUpdate() {
    this.forceUpdate();
  }

  public onWidthChange() {
    for (const panel of this.dashboard.panels) {
      panel.resizeDone();
    }
  }

  public updateGridPos(item, layout) {
    if (!this.dashboard.meta.fullscreen) {
      this.panelMap[item.i].updateGridPos(item);
    }

    // react-grid-layout has a bug (#670), and onLayoutChange() is only called when the component is mounted.
    // So it's required to call it explicitly when panel resized or moved to save layout changes.
    this.onLayoutChange(layout);
  }

  public onResize(layout, oldItem, newItem) {
    if (!this.dashboard.meta.fullscreen) {
      this.panelMap[newItem.i].updateGridPos(newItem);
    }
  }

  public onResizeStop(layout, oldItem, newItem) {
    if (!this.dashboard.meta.fullscreen) {
      this.updateGridPos(newItem, layout);
      this.panelMap[newItem.i].resizeDone();
    }
  }

  public onDragStop(layout, oldItem, newItem) {
    if (!this.dashboard.meta.fullscreen) {
      this.updateGridPos(newItem, layout);
    }
  }

  public componentDidMount() {
    setTimeout(() => {
      this.setState(() => {
        return { animated: true };
      });
    });
  }

  public renderPanels() {
    const panelElements = [];

    for (const panel of this.dashboard.panels) {
      const panelClasses = classNames({ panel: true, 'panel--fullscreen': panel.fullscreen });
      panelElements.push(
        /** panel-id is set for html bookmarks */
        <div key={panel.id.toString()} className={panelClasses} id={`panel-${panel.id.toString()}`}>
          <DashboardPanel panel={panel} dashboard={this.props.dashboard} />
        </div>
      );
    }

    return panelElements;
  }

  public render() {
    return (
      <SizedReactLayoutGrid
        className={classNames({
          layout: true,
          animated: this.state.animated,
        })}
        layout={this.buildLayout()}
        isResizable={!this.dashboard.meta.fullscreen}
        isDraggable={!this.dashboard.meta.fullscreen}
        onLayoutChange={this.onLayoutChange}
        onWidthChange={this.onWidthChange}
        onDragStop={this.onDragStop}
        onResize={this.onResize}
        onResizeStop={this.onResizeStop}
      >
        {this.renderPanels()}
      </SizedReactLayoutGrid>
    );
  }
}
