import jQuery from 'jquery';

const showTooltip = (x, y, contents) => {
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
};

export default function GraphTooltip(this: any, elem) {
  const self = this;

  const $tooltip = jQuery('<div class="graph-tooltip">');
  jQuery(elem).append($tooltip);
  this.destroy = () => {
    $tooltip.remove();
  };

  this.clear = plot => {
    $tooltip.detach();
    plot.clearCrosshair();
    plot.unhighlight();
  };
  jQuery(elem).bind('plothover', (event, pos, item) => {
    this.show(pos, item);
  });

  this.clear = plot => {
    $tooltip.detach();
    plot.clearCrosshair();
    plot.unhighlight();
  };

  this.show = (pos, item) => {
    const plot = jQuery(elem).data().plot;
    const plotData = plot.getData();
    const xAxes = plot.getXAxes();
    const xMode = xAxes[0].options.mode;

    if (pos) {
      const pointOffset = plot.pointOffset({ x: pos.x });
      if (
        Number.isNaN(pointOffset.left) ||
        pointOffset.left < 0 ||
        pointOffset.left > jQuery(elem).width()
      ) {
        self.clear(plot);
        return;
      }
      pos.pageX = jQuery(elem).offset().left + pointOffset.left;
      pos.pageY = jQuery(elem).offset().top + jQuery(elem).height() * 1;
      const isVisible =
        pos.pageY >= jQuery(window).scrollTop() &&
        pos.pageY <= jQuery(window).innerHeight() + jQuery(window).scrollTop();
      if (!isVisible) {
        self.clear(plot);
        return;
      }
      plot.setCrosshair(pos);
    }
  };
  this.renderAndShow = (absoluteTime, innerHtml, pos, xMode) => {
    if (xMode === 'time') {
      innerHtml = '<div class="graph-tooltip-time">' + absoluteTime + '</div>' + innerHtml;
    }
    $tooltip.html(innerHtml);
  };
}
