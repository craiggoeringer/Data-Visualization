const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countyURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

let countyData;
let educationData;

const colors = ["rgba(0, 12, 179, 1)", "rgba(0, 179, 12, 1)", "rgba(255, 247, 0, 1)", "rgba(255, 123, 0, 1)", "rgba(255, 0, 0, 1)"];

const canvas = d3.select("#canvas");
const tooltip = d3.select("#tooltip");

const legendAxisLength = 250;

let drawMap = () => {

  let legendScale = d3.scaleLinear().
  domain([0, 75]).
  range([0, legendAxisLength]);

  const legendAxis = d3.axisBottom(legendScale).
  tickValues([15, 30, 45, 60]).
  tickFormat(d => d + "%").
  tickSizeOuter(0);


  canvas.selectAll("path").
  data(countyData).
  enter().
  append("path").
  attr("d", d3.geoPath()).
  attr("class", "county").

  attr("fill", countyDataItem => {
    let id = countyDataItem.id;
    let county = educationData.find(item => {
      return item.fips === id;
    });
    let percentage = county.bachelorsOrHigher;
    if (percentage < 15) {
      return colors[0];
    } else if (percentage < 30) {
      return colors[1];
    } else if (percentage < 45) {
      return colors[2];
    } else if (percentage < 60) {
      return colors[3];
    } else {
      return colors[4];
    }
  }).
  attr("data-fips", countyDataItem => countyDataItem.id).
  attr("data-education", countyDataItem => {
    let id = countyDataItem.id;
    let county = educationData.find(item => {
      return item.fips === id;
    });
    return county.bachelorsOrHigher;
  }).
  on("mouseover", (e, countyDataItem) => {
    tooltip.transition().
    style("visibility", "visible");
    let id = countyDataItem.id;
    let county = educationData.find(item => {
      return item.fips === id;
    });
    tooltip.text(`${county.fips}-${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`).
    attr("data-education", county.bachelorsOrHigher);
  }).
  on("mouseout", countyDataItem => {
    tooltip.transition().
    style("visibility", "hidden");
  });

  canvas.append("g").
  attr("id", "legend").
  attr("transform", "translate(900, 600)").
  call(legendAxis).
  selectAll("rect").
  data(colors).
  enter().
  append("rect").
  attr("width", legendAxisLength / 5).
  attr("height", 20).
  attr("fill", d => d).
  attr("transform", (d, i) => `translate(${legendAxisLength * i / 5}, -20)`);
};

d3.json(countyURL).then(
(data, error) => {
  if (error) {
    console.log(log);
  } else {
    countyData = topojson.feature(data, data.objects.counties).features;

    d3.json(educationURL).then(
    (data, error) => {
      if (error) {
        console.log(log);
      } else {
        educationData = data;
        drawMap();
      }
    });

  }
});
