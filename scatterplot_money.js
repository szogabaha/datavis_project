

// Map data to the needs of the chart, groupby etc
function getScatterMoneyData(data) {

    data = data.filter(d => d.selected);

    data.forEach(item => {
        
    });

    // caclulate revenue 

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
function plotScatterMoney(data) {

  const transformedData = getScatterMoneyData(data)

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


