// Libraries
import jQuery from 'jquery';
import React, { PureComponent } from 'react';
import { withSize } from 'react-sizeme';
import '../../vendor/flot/jquery.flot';
import '../../vendor/flot/jquery.flot.time';
import GraphTooltip from './graph_tooltip';

import '@/vendor/flot/jquery.flot';
import '@/vendor/flot/jquery.flot.selection';
import '@/vendor/flot/jquery.flot.time';
import '@/vendor/flot/jquery.flot.stack';
import '@/vendor/flot/jquery.flot.stackpercent';
import '@/vendor/flot/jquery.flot.fillbelow';
import '@/vendor/flot/jquery.flot.crosshair';
import '@/vendor/flot/jquery.flot.dashes';
// Types
import { TimeRange, TimeSeriesVMs } from '@/core/types';
import { result } from './data';
const points = result.A.series[0].points.map(item => {
  return [item[1], item[0]];
});
function showTooltip(x, y, contents) {
  jQuery('<div id="tooltip">' + contents + '</div>')
    .css({
      position: 'absolute',
      display: 'none',
      top: y + 10,
      left: x + 10,
      border: '1px solid #fdd',
      padding: '2px',
      'background-color': '#dfeffc',
      opacity: 0.8,
    })
    .appendTo('body')
    .fadeIn(200);
}

interface GraphProps {
  timeSeries: TimeSeriesVMs;
  timeRange: TimeRange;
  showLines?: boolean;
  showPoints?: boolean;
  showBars?: boolean;
  size?: { width: number; height: number };
}

export class Graph extends PureComponent<GraphProps> {
  static defaultProps = { showLines: true, showPoints: false, showBars: false };
  tooltip: any;
  elem: any;
  constructor(props) {
    super(props);
  }
  element: any;

  componentDidUpdate(prevProps: GraphProps) {
    if (
      prevProps.timeSeries !== this.props.timeSeries ||
      prevProps.timeRange !== this.props.timeRange ||
      prevProps.size !== this.props.size
    ) {
      this.draw();
    }
  }

  componentDidMount() {
    this.draw();
    this.tooltip = new GraphTooltip(this.element);
  }

  draw() {
    const { size, timeSeries, timeRange, showLines, showBars, showPoints } = this.props;
    if (!size) {
      return;
    }
    const ticks = size.width / 100;
    const min = 1545592565881;
    const max = 1545614135881;

    const flotOptions = {
      legend: { show: false },
      series: {
        lines: { show: showLines, linewidth: 1, zero: false },
        points: { show: showPoints, fill: 1, fillColor: false, radius: 2 },
        bars: { show: showBars, fill: 1, barWidth: 1, zero: false, lineWidth: 0 },
        shadowSize: 0,
      },
      xaxis: {
        mode: 'time',
        min: min,
        max: max,
        label: 'Datetime',
        ticks: ticks,
        timeformat: time_format(ticks, min, max),
      },
      grid: {
        minBorderMargin: 0,
        markings: [],
        backgroundColor: null,
        borderWidth: 0, // hoverable: true,
        hoverable: true,
        clickable: true,
        color: '#a1a1a1',
        margin: { left: 0, right: 0 },
        labelMarginX: 0,
      },
      tooltip: {
        value_type: 'individual',
        shared: true,
        sort: 0,
      },
    };

    try {
      jQuery.plot(this.element, [{ label: 'Foo', data: points }], flotOptions);
    } catch (err) {
      console.log('Graph rendering error', err, flotOptions, timeSeries);
    }
  }
  onGraphHover(evt) {
    this.tooltip.show(evt.pos);
  }
  render() {
    return (
      <div className="graph-panel">
        <div
          onMouseEnter={this.onGraphHover.bind(this)}
          ref={e => (this.element = e)}
          className="graph-panel__chart"
        />
      </div>
    );
  }
}

// Copied from graph.ts
function time_format(ticks, min, max) {
  if (min && max && ticks) {
    const range = max - min;
    const secPerTick = range / ticks / 1000;
    const oneDay = 86400000;
    const oneYear = 31536000000;

    if (secPerTick <= 45) {
      return '%H:%M:%S';
    }
    if (secPerTick <= 7200 || range <= oneDay) {
      return '%H:%M';
    }
    if (secPerTick <= 80000) {
      return '%m/%d %H:%M';
    }
    if (secPerTick <= 2419200 || range <= oneYear) {
      return '%m/%d';
    }
    return '%Y-%m';
  }

  return '%H:%M';
}

export default withSize({ monitorHeight: true })(Graph);
