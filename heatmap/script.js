const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const margin = { top: 20, right: 30, bottom: 90, left: 80 };
const width = 1200 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

let x;
let y;

let minVal, medVal, maxVal;
let baseTemperature;

const format = d3.timeFormat("%B");

const svg = d3.
select("#canvas").
attr("preserveAspectRatio", "xMinYMin meet").
attr(
"viewBox",
`0 0 ${width + margin.left + margin.right} ${
height + margin.top + margin.bottom
}`).

append("g").
attr("transform", `translate(${margin.left}, ${margin.top})`);
const container = d3.select(".container");

const tooltip = d3.
select(".container").
append("div").
style("opacity", 0).
attr("id", "tooltip").
style("background-color", "rgba(255,255,255,0.7)").
style("font-size", "1rem").
style("border", "solid").
style("border-width", "2px").
style("border-radius", "5px").
style("padding", "5px");

const mouseover = function (event, d) {
  tooltip.style("opacity", 1);
};
const mousemove = function (event, d) {
  let containerW = container.style("width").slice(0, -2);

  let date = new Date();
  date.setUTCMonth(d.month);

  tooltip.
  attr("data-year", d.year).
  style("background-color", "rgba(255,255,255,0.7)").
  html(
  `${format(date)}, ${d.year} <br>
          Temp: ${(baseTemperature + d.variance).toFixed(
  2)
  }°C (${d.variance.toFixed(2)})`).

  style(
  "left",
  event.offsetX < containerW / 2 ?
  event.offsetX + 30 + "px" :
  event.offsetX - 200 + "px").

  style("top", event.offsetY + 30 + "px");
};
const mouseleave = function (event, d) {
  tooltip.style("opacity", 0);
};

const generateAxes = data => {
  x = d3.
  scaleBand().
  range([0, width]).
  domain(data.monthlyVariance.map(d => d.year)).
  padding(0);

  y = d3.
  scaleBand().
  domain(data.monthlyVariance.map(d => d.month)).
  range([0, height]).
  padding(0);

  svg.
  append("g").
  attr("id", "x-axis").
  attr("transform", `translate(0, ${height})`).
  call(
  d3.
  axisBottom(x).
  tickValues(x.domain().filter(d => d % 10 === 0)).
  tickSize(10, 1));


  svg.
  append("g").
  attr("id", "y-axis").
  call(
  d3.
  axisLeft(y).
  tickValues(y.domain()).
  tickFormat(month => {
    let date = new Date();
    date.setUTCMonth(month);

    return format(date);
  }).
  tickSize(10, 1));

};

const generateCell = data => {
  console.log("min", minVal);
  console.log("median", medVal);
  console.log("max", maxVal);

  const myColor = d3.
  scaleSequential(d3.interpolateRdYlBu).
  domain([maxVal, minVal]);

  svg.
  append("g").
  classed("map", true).
  selectAll("rect").
  data(data.monthlyVariance).
  enter().
  append("rect").
  attr("class", "cell").
  attr("data-month", d => d.month).
  attr("data-year", d => d.year).
  attr("data-temp", d => baseTemperature + d.variance).
  attr("x", d => x(d.year)).
  attr("y", d => y(d.month)).
  attr("width", d => x.bandwidth(d.year)).
  attr("height", d => y.bandwidth(d.month)).
  attr("fill", d => myColor(baseTemperature + d.variance)).
  on("mouseover", mouseover).
  on("mousemove", mousemove).
  on("mouseleave", mouseleave);
};

const generateLegend = data => {
  let legendData = [];
  let legendAxisData = [];

  for (let i = minVal; i < maxVal; i += (maxVal - minVal) / 10) {
    legendData.push(i.toFixed(0));
  }

  for (let i = minVal; i < maxVal; i += (maxVal - minVal) / 5) {
    legendAxisData.push(i.toFixed(0));
  }
  legendAxisData.push(maxVal.toFixed(0));

  const legendColor = d3.
  scaleSequential(d3.interpolateRdYlBu).
  domain([maxVal, minVal]);

  const legendWidth = width / 2 / legendData.length;

  svg.
  append("g").
  attr("id", "legend").
  attr(
  "transform",
  `translate(${width * 0.25}, ${height + margin.top + 15})`).

  selectAll("rect").
  data(legendData).
  enter().
  append("rect").
  attr("stroke", "#000").
  attr("x", (d, i) => i * legendWidth).
  attr("width", legendWidth).
  attr("height", 20).
  attr("fill", d => legendColor(d));

  var xAxisLegend = d3.
  scaleBand().
  range([0, width / 2]).
  domain(legendData).
  padding(0);

  svg.
  append("g").
  attr("id", "legend-axis").
  attr(
  "transform",
  `translate(${width * 0.25}, ${height + margin.top + 37})`).

  call(
  d3.
  axisBottom(xAxisLegend).
  tickSize(5).
  tickFormat(x => `${x} °C`));

};

d3.json(url).
then(data => {
  data.monthlyVariance.forEach(d => d.month -= 1);
  console.log("API data", data);

  minVal = d3.min(
  data.monthlyVariance,
  d => data.baseTemperature + d.variance);

  medVal = d3.median(
  data.monthlyVariance,
  d => data.baseTemperature + d.variance);

  maxVal = d3.max(
  data.monthlyVariance,
  d => data.baseTemperature + d.variance);

  baseTemperature = data.baseTemperature;

  generateAxes(data);
  generateCell(data);
  generateLegend(data);
}).
catch(error => {
  console.log(error);
});
