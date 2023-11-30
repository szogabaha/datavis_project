// Map data to the needs of the chart, groupby etc
function getLineData(data, scorekind = "rotten_tomatoes") {
  // get only those that have the field "selected" to true
  data = data.filter(d => d.selected);

 
}

function updateLine(data) {
  const transformedData = getLineData(data);
  //TODO
}

function plotLine(data, lineTotalWidth = 1000, lineTotalHeight = 400, animationDelay = 2000) {
  
  let lineMargin = { top: 30, right: 30, bottom: 40, left: 100 },
  lineWidth = lineTotalWidth - lineMargin.left - lineMargin.right,
  lineHeight = lineTotalHeight - lineMargin.top - lineMargin.bottom;

  let processedData = getLineData(data);



}
