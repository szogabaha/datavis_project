

// Map data to the needs of the chart, groupby etc
function getBarData(data, scorekind = "imdb") {
  data.forEach(item => {
    const date = new Date(item["Release date"]);
    item.year = date.getFullYear();
  });
  
  // Step 2: Group the data by the extracted year.
  let groupedData = data.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = [];
    }
    parsedscore = parseFloat(item[scorekind])
    if (!isNaN(parsedscore)) {
      acc[item.year].push(parsedscore);
    }
    return acc;
  }, {});
  console.log(groupedData)
  
  // Step 3: For each group, calculate the average of the "imdb" field.
  let averageData = {};
  for (let year in groupedData) {
    let sum = groupedData[year].reduce((a, b) => a + b, 0);
    let avg = sum / groupedData[year].length;
    averageData[year] = avg;
  }
  console.log(averageData)
  return averageData;

}

function updateBar(data) {
    const transformedData = getBarData(data);
}

// Do the plot here
function plotBar(data) {
  const yearScores = getBarData(data);

  
  const years = Object.keys(yearScores);
  const avgScores = Object.values(yearScores);

  const svg = d3.select("#barplot")
        .append("svg")
        .attr("width", 500)
        .attr("height", 300);

  const x = d3.scaleBand()
        .domain(years)
        .range([0, 500])
        .padding(0.2);

  const y = d3.scaleLinear()
        .domain([0, d3.max(avgScores)])
        .range([300, 0]);

  svg.append("g")
     .attr("transform", "translate(0," + 300 + ")")
     .call(d3.axisBottom(x));

  svg.append("g")
     .call(d3.axisLeft(y));

  svg.selectAll("rect")
     .data(years)
     .enter()
     .append("rect")
     .attr("x", (d) => x(d))
     .attr("y", (d) => y(yearScores[d]))
     .attr("width", x.bandwidth())
     .attr("height", (d) => 300 - y(yearScores[d]))
     .attr("fill", "#69b3a2");

}


