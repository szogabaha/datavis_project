

// Map data to the needs of the chart, groupby etc
function getScatterMoneyData(data) {

    data = data.filter(d => d.selected);

    data.forEach(item => {
        d.budget = Number(item["Budget"]);
        d.box_office = Number(item["Box office"]);
        d.revenue = Number(item["Revenue"]);
    });
}


// Obj, all data that the updateEx1Chart function needs
var EX1_CONFIG = null;

// Update the chart according to some request
// Receives the filtered data!
function updateScatterMoney(data) {
  const transformedData = getScatterMoneyData(data);
  //Do the transition here using EX1_CONFIG + transformedData
}

// Do the plot here
function plotScatterMoney(data, scatterTotalWidth = 800, scatterTotalHeight = 800, animationDelay = 2000) {

  const transformedData = getScatterMoneyData(data)

  let margin = { top: 30, right: 30, bottom: 40, left: 100 },
  scatterWidth = scatterTotalWidth - margin.left - margin.right,
  scatterHeight = scatterTotalHeight - margin.top - margin.bottom;

  let moneyData = getScatterMoneyData(data);

  const g = SVG.append("g")
    .attr("transform", `translate(${x + margin.left}, ${y + margin.top})`)



  //Store everything here that the update will need
  // EX1_CONFIG = {
  //   "xTick": xTick,
  //   "yTick": yTick,
  //   "barHeight": barHeight
  // }

}


