let barTotalWidth = 1000, barTotalHeight = 150;
let barMargin = { top: 30, right: 30, bottom: 40, left: 100 },
  barWidth = barTotalWidth - barMargin.left - barMargin.right,
  barHeight = barTotalHeight - barMargin.top - barMargin.bottom;



// Map data to the needs of the chart, groupby etc
function getBarData(data, scorekind = "rotten_tomatoes") {
  console.log(data)
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
  
  //remove key NaN
  delete groupedData["NaN"]
  console.log(groupedData)
  

  // Step 3: For each group, calculate the average of the "imdb" field.
  let averageData = {};
  for (let year in groupedData) {
    //if its imdb multiply by 10 each mark
    if (scorekind == "imdb") {
      groupedData[year] = groupedData[year].map(x => x * 10);
    }
    //set avg as 0 if no data
    if (groupedData[year].length == 0) {
      averageData[year] = 0;
      continue;
    }
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
  const yearScores = getBarData(data, "metascore");


  const years = Object.keys(yearScores);
  const avgScores = Object.values(yearScores);

  const svg = d3.select("#barplot")
    .append("svg")
    .attr("width", barTotalWidth)
    .attr("height", barTotalHeight);

  const x = d3.scaleBand()
    .domain(years)
    .range([barMargin.left, barTotalWidth - barMargin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(avgScores)])
    .range([barTotalHeight - barMargin.bottom, barMargin.top]);

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
    .attr("height", (d) => y(0) - y(yearScores[d]))
    .attr("fill", "#69b3a2");


  // Add X and Y axis
  svg.append("g")
    .attr("transform", `translate(0, ${barTotalHeight - barMargin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")  
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", "-.3em")
    .attr("transform", "rotate(-90)");

  svg.append("g")
    .attr("transform", `translate(${barMargin.left}, 0)`)
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", barMargin.left + barWidth / 2)
    .attr("y", barMargin.top)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text("Age Distribution");

  svg.append("text")
    .attr("x", barMargin.top)
    .attr("y", barMargin.left - 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text("Average Score")
    .attr("transform", "rotate(-90, 0, 0) translate(-100, -10)");

  svg.append("text")
    .attr("x", barMargin.left + barWidth / 2)
    .attr("y", barMargin.bottom + barHeight + 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text("Year");


  document.getElementById('scoreSelect').addEventListener('change', function() {
    let scoreType = this.value;
    let averageData = getBarData(data, scoreType);
    let bars = svg.selectAll("rect").data(Object.keys(averageData));

    // Use the .exit() and .remove() methods to remove any bars that no longer have corresponding data
    bars.exit().remove();

    // Use the .enter() method to create new bars for any new data
    bars.enter().append("rect")
      .attr("x", (d) => x(d))
      .attr("width", x.bandwidth())
      .attr("fill", "#69b3a2");

    // Update the y attribute and height of all bars (both existing and new)
    // Add a transition to animate the height change
    bars.attr("x", (d) => x(d))
      .attr("y", (d) => y(averageData[d]))
      .transition()
      .duration(1000)
      .attr("height", (d) => y(0) - y(averageData[d]))
    });




}


