// set position of plot
const scatter_scoreDiv = document.getElementById("scatterplot_score");
scatter_scoreDiv.style.position = "relative";
scatter_scoreDiv.style.left = 1000 + "px"; // adjust as needed
scatter_scoreDiv.style.top = 0 + "px"; // adjust as needed

// Map data to the needs of the chart, groupby etc
function getScatterScoreData(data) {

    data = data.filter(d => d.selected);

    data.forEach(d => {
        d.imdb = Number(d["imdb"]);
        d.metascore = Number(d["metascore"]);
        d.rotten_tomatoes = Number(d["rotten_tomatoes"]);
    });
    return data;
}


// Obj, all data that the updateEx1Chart function needs
var EX1_CONFIG = null;

// Update the chart according to some request
// Receives the filtered data!
function updateScatterScore(data) {
  const transformedData = getScatterScoreData(data);
  //Do the transition here using EX1_CONFIG + transformedData
}

// Do the plot here
function plotScatterScore(data) {

  const transformedData = getScatterScoreData(data)

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


