

// Map data to the needs of the chart, groupby etc
function getEx1Data(data) {

}


// Obj, all data that the updateEx1Chart function needs
var EX1_CONFIG = null;

// Update the chart according to some request
// Receives the filtered data!
function updateEx1(data) {
  const transformedData = getEx1Data(data);
  //Do the transition here using EX1_CONFIG + transformedData
}

// Do the plot here
function plotExample1(data) {

  const transformedData = getEx1Data(data)

  // const g = SVG.append("g")
  //   .attr("transform", `translate(${x + margin.left}, ${y + margin.top})`)
  //.......


  //Store everything here that the update will need
  // EX1_CONFIG = {
  //   "xTick": xTick,
  //   "yTick": yTick,
  //   "barHeight": barHeight
  // }

}


