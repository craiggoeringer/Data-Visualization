document.addEventListener('DOMContentLoaded', function () {

  req = new XMLHttpRequest();
  req.open("GET", 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json', true);
  req.send();
  req.onload = function () {
    json = JSON.parse(req.responseText);
    var dataset = json;
    var colors = d3.scaleOrdinal().
    range(d3.schemeCategory10.map(function (c) {c = d3.rgb(c);c.opacity = 0.7;return c;}));
    var w = 1100;
    var h = 750;
    var padding = 100;
    var svg = d3.select('#d3Tree').
    append('svg').
    attr('width', w).
    attr('height', h + padding);

    var treemap = d3.treemap().
    size([w, h]).
    paddingInner(1);
    var root = d3.hierarchy(dataset).
    sum(function (d) {return d.value;}).
    sort(function (a, b) {return b.height - a.height || b.value - a.value;});
    treemap(root);

    var tooltip = d3.select('#d3Tree').
    append('div').
    attr('id', 'tooltip').
    attr('opacity', '0');
    var cells = svg.selectAll('g').
    data(root.leaves()).
    enter().
    append('g').
    attr("transform", d => {return "translate(" + d.x0 + "," + d.y0 + ")";});
    var tile = cells.append('rect').
    attr('class', 'tile').
    attr('width', d => d.x1 - d.x0).
    attr('height', d => d.y1 - d.y0).
    attr('fill', d => colors(d.data.category)).
    attr('data-value', d => d.data.value).
    attr('data-name', d => d.data.name).
    attr('data-category', d => d.data.category).
    on("mouseover", function (d, i) {
      tooltip.transition().
      duration(200).
      style("opacity", .9);
      tooltip.html('<strong><u>' + d.data.category + '</u></strong>' + "<br/>" + 'Name: ' + d.data.name + '<br/>' + 'Value: ' + d.data.value).
      style("left", d3.event.pageX + "px").
      style("top", d3.event.pageY - 50 + "px").
      attr('data-value', d.data.value);
    }).
    on("mouseout", function (d) {
      tooltip.transition().
      duration(500).
      style("opacity", 0);
    });
    cells.append('text').
    selectAll('tspan').
    data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g)).
    enter().
    append('tspan').
    style('font-size', 11).
    attr('x', 5).
    attr('y', (d, i) => i * 11 + 10).
    text(d => d);

    var categoryList = root.leaves().map(d => d.data.category);
    var catArr = [...new Set(categoryList)];

    var legend = svg.selectAll('.legend').
    data(catArr).
    enter().
    append('g').
    attr('class', 'legend').
    attr('id', 'legend').
    attr("transform", (d, i) => "translate(" + i * 15 * 10 + ",0)");

    legend.append("rect").
    attr('class', 'legend-item').
    attr("x", 40).
    attr('y', h + padding - 75).
    attr("width", 18).
    attr("height", 18).
    style("fill", d => colors(d));

    legend.append("text").
    style("fill", "black").
    attr("x", 70).
    attr("y", h + padding - 60).
    style("text-anchor", "start").
    text((d, i) => d);
  };
});
