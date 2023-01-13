document.addEventListener("DOMContentLoaded", () => {
  getCyclistData();
});

let getCyclistData = () => {
  let ajaxRequest = new XMLHttpRequest();
  ajaxRequest.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json", "true");
  ajaxRequest.send();
  ajaxRequest.onload = () => {
    const responseData = ajaxRequest.responseText;
    const responseDatasetInJSON = JSON.parse(responseData);
    loadDopingChart(responseDatasetInJSON);
  };
};

let loadDopingChart = dopingDataset => {
  const svgHeight = getChartHeight();
  const svgWidth = getChartWidth();
  const padding = getChartPadding();
  const specifier = "%M:%S";
  const parsedData = getParsedData(dopingDataset, specifier);

  let svg = loadSvg(svgHeight, svgWidth);
  let legend = d3.select("body").
  append("div").
  attr("id", "legend").
  attr("height", 100).
  attr("width", 100).
  attr("fill", "red").
  style("left", `50px`).
  style("top", `100px`).
  html(`<div style="display:flex;font-size:13px;">
              <div style="background-color:#5790C2;width:20px;height:20px;">
              </div>
              <div style="padding-left:10px;">Riders with doping allegations</div>
             </div>
             <div style="display:flex;padding-top:5px;font-size:13px;">
              <div style="background-color:#FC813F;width:20px;height:20px;">
              </div>
              <div style="padding-left:10px;">No doping allegations</div>
             </div>`);

  let tooltip = d3.select("body").
  append("div").
  attr("id", "tooltip").
  style("opacity", 0);

  let circlesInSvg = addCirclesInSvg(svg, dopingDataset);
  circlesInSvg.attr("cx", (d, i) => xScale(dopingDataset, svgWidth, padding)(new Date(d.Year))).
  attr("cy", (d, i) => yScale(parsedData, svgHeight, padding)(d3.timeParse(specifier)(d.Time))).
  attr("r", 6).
  attr("data-xvalue", d => d.Year).
  attr("data-yvalue", (d, i) => d3.timeParse(specifier)(d.Time).toISOString()).
  attr("fill", (d, i) => {
    if (d.Doping) {
      return "#5790C2";
    }
    return "#FC813F";
  }).
  on("mouseover", d => {
    tooltip.style("opacity", 1).
    attr("data-year", d.Year).
    html(`${d.Name}: ${d.Nationality}<br>
                                  Year: ${d.Year} Time: ${d.Time}<br></br>${d.Doping}`).
    style("left", `${20 + xScale(dopingDataset, svgWidth, padding)(new Date(d.Year))}px`).
    style("top", `${yScale(parsedData, svgHeight, padding)(d3.timeParse(specifier)(d.Time))}px`);
  }).
  on("mouseout", (d, i) => {
    tooltip.style("opacity", 0);
  });

  let xAxis = d3.axisBottom(xScale(dopingDataset, svgWidth, padding)).tickFormat(d3.format("d"));
  loadXAxis(svg, xAxis, svgHeight, padding);

  let yAxis = d3.axisLeft(yScale(parsedData, svgHeight, padding)).tickFormat(d => d3.timeFormat(specifier)(d));
  loadYAxis(svg, yAxis, padding);


};
const getChartHeight = () => 600;
const getChartWidth = () => 1200;
const getChartPadding = () => 100;
const loadSvg = (height, width) => {
  return d3.select("body").
  append("svg").
  attr("height", height).
  attr("width", width);
};

const addCirclesInSvg = (svg, dataset) => {
  return svg.selectAll("circle").
  data(dataset).
  enter().
  append("circle").
  attr("class", "dot");
};
const addLabelsOnCircles = (svg, dataset, fontSize) => {
  return svg.selectAll("text").
  data(dataset).
  enter().
  append("text").
  style("font-size", fontSize).
  text((d, i) => `${d.Time}`);
};
const loadXAxis = (svg, xAxis, height, padding) => {
  svg.append("g").
  attr("transform", `translate(0,${height - padding})`).
  attr("id", "x-axis").
  call(xAxis);
};
const loadYAxis = (svg, yAxis, padding) => {
  svg.append("g").
  attr("transform", `translate(${padding},0)`).
  attr("id", "y-axis").
  call(yAxis);
};
const getParsedData = (dataset, specifier) => {
  return dataset.map(d => {
    return d3.timeParse(specifier)(d.Time);
  });
};

let xScale = (dataset, width, padding) => {
  return d3.scaleTime().
  domain([d3.min(dataset, (d, i) => new Date(d.Year - 1)), d3.max(dataset, (d, i) => new Date(d.Year + 1))]).
  range([padding, width - padding]);
};

let yScale = (parsedData, height, padding) => {
  return d3.scaleTime().
  domain(d3.extent(parsedData)).
  range([padding, height - padding]).
  nice();
};

let ySecondsScale = (dataset, height, padding) => {
  return d3.scaleTime().
  domain([d3.min(dataset, (d, i) => d.Seconds), d3.max(dataset, (d, i) => d.Seconds)]).
  range([padding, height - padding]);
};
