// Map data to the needs of the chart, groupby etc
function getLineData(data, scorekind = "rotten_tomatoes") {

  // get only those that have the field "selected" to true
  data = data.filter(d => d.selected);

}

function updateLine(data) {
  const transformedData = getBarData(data);
  //TODO
}

function plotLine(data, barTotalWidth = 1000, barTotalHeight = 400, animationDelay = 2000) {
  
  let barMargin = { top: 30, right: 30, bottom: 40, left: 100 },
  barWidth = barTotalWidth - barMargin.left - barMargin.right,
  barHeight = barTotalHeight - barMargin.top - barMargin.bottom;

  let processedData = getLineData(data);



}
