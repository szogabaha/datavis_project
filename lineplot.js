// Map data to the needs of the chart, groupby etc
function getLineData(data, scorekind = "rotten_tomatoes") {

  // get only those that have the field "selected" to true
  data = data.filter(d => d.selected);

  data.forEach(item => {
    const date = new Date(item["Release date"]);
    item.year = date.getFullYear();
  });

  // Step 2: Group the data by the extracted year.
  let groupedData = data.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = {"Revenues": [], "RunningTimes": []};
    }
    revenue = item["Revenue"];
    if (!isNaN(revenue) && (revenue != "")) {
      acc[item.year]["Revenues"].push(revenue);
    }

    runningtime = parseFloat(item["Running time"])
    if (!isNaN(runningtime) && (runningtime != "")) {
      acc[item.year]["RunningTimes"].push(runningtime);
    }
    return acc;
  }, {});
  
  //remove key NaN
  delete groupedData["NaN"]
  
  // Step 3: For each group, calculate the average of the "imdb" field.
  let revenueData = {};
  let runningTimeData = {};

  for (let year in groupedData) {
    let sumRevenue = 0;
    let sumRunningTime = 0;
    let countRunningTime = 0;

    for (let revenue of groupedData[year]["Revenues"]) {
      sumRevenue += revenue;
    }

    for (let runningTime of groupedData[year]["RunningTimes"]) {
      if (!isNaN(runningTime)) {
        sumRunningTime += runningTime;
        countRunningTime++;
      }
    }

    if (groupedData[year]["Revenues"].length == 0 && groupedData[year]["RunningTimes"].length == 0) {
      revenueData[year] = 0;
      runningTimeData[year] = 0;
      continue;
    }

    let avg = sumRunningTime / countRunningTime;
    runningTimeData[year] = avg;
    revenueData[year] = sumRevenue;
  }

  return revenueData, runningTimeData;

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
