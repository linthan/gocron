// Libraries
import jQuery from 'jquery';
import React, { PureComponent } from 'react';
import { withSize } from 'react-sizeme';
import '../../vendor/flot/jquery.flot';
import '../../vendor/flot/jquery.flot.time';

// Types
import { TimeRange, TimeSeriesVMs } from '@/core/types';

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
  }

  draw() {
    const { size, timeSeries, timeRange, showLines, showBars, showPoints } = this.props;
    if (!size) {
      return;
    }
    const ticks = size.width / 100;
    const min = 1545513141280;
    const max = 1545534711280;

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
        clickable: true,
        color: '#a1a1a1',
        margin: { left: 0, right: 0 },
        labelMarginX: 0,
      },
    };

    try {
      console.log('Graph render');
      jQuery.plot(
        this.element,

        [
          { label: 'Foo', data: [[10, 1], [17, -14], [30, 5]] },
          { label: 'Bar', data: [[11, 13], [19, 11], [30, -7]] },
        ],
        {
          grid: {
            borderWidth: 0, // hoverable: true,
          },
        }
      );
    } catch (err) {
      console.log('Graph rendering error', err, flotOptions, timeSeries);
    }
  }

  render() {
    return (
      <div className="graph-panel">
        <div ref={e => (this.element = e)} className="graph-panel__chart" />
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
