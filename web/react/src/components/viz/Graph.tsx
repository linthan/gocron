// Libraries
import React, { PureComponent } from 'react';
import { withSize } from 'react-sizeme';
import * as d3 from 'd3';
// import '../../vendor/flot/jquery.flot';
// import '../../vendor/flot/jquery.flot.time';

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
  static defaultProps = {
    showLines: true,
    showPoints: false,
    showBars: false,
  };

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
    const data = [
      { letter: 'a', name: 'a', frequemcy: 1, value: 1 },
      { letter: 'b', name: 'b', frequemcy: 2, value: 2 },
      { letter: 'c', name: 'c', frequemcy: 3, value: 3 },
    ];
    const margin = { top: 20, right: 0, bottom: 30, left: 40 };
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([size.height - margin.bottom, margin.top]);
    const x = d3
      .scaleBand()
      .domain(data.map(d => d.name))
      .range([margin.left, size.width - margin.right])
      .padding(0.1);
    const yAxis = g =>
      g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select('.domain').remove());
    const xAxis = g =>
      g
        .attr('transform', `translate(0,${size.height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));
    d3.select(this.element)
      .selectAll('*')
      .remove();
    const svg = d3.select(this.element);
    svg
      .append('g')
      .attr('fill', 'steelblue')
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.name))
      .attr('y', d => y(d.value))
      .attr('height', d => y(0) - y(d.value))
      .attr('width', x.bandwidth());

    svg.append('g').call(xAxis);

    svg.append('g').call(yAxis);
  }

  render() {
    const { size } = this.props;
    return (
      <div className="graph-panel">
        <div className="graph-panel__chart">
          <svg width={size.width} height={size.height} ref={e => (this.element = e)} />
        </div>
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
