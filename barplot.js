// Map data to the needs of the chart, groupby etc
function getBarData(data, scorekind = "rotten_tomatoes") {
  
  // get only those that have the field "selected" to true
  data = data.filter(d => d.selected);
  

  // Step 2: Group the data by the extracted year.
  let groupedData = data.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = [];
    }
    parsedscore = parseFloat(item[scorekind])
    if (!isNaN(parsedscore) && (parsedscore != 0)) {
      acc[item.year].push(parsedscore);
    }
    return acc;
  }, {});

  console.log(groupedData)
  //remove key NaN
  delete groupedData["NaN"]


  // Step 3: For each group, calculate the average of the "imdb" field.
  let returnData = {};
  for (let year in groupedData) {
    //if its imdb multiply by 10 each mark
    if (scorekind == "imdb") {
      groupedData[year] = groupedData[year].map(x => x * 10);
    }
    //set avg as 0 if no data
    if (groupedData[year].length == 0) {
      returnData[year] = 0;
      continue;
    }
    let sum = groupedData[year].reduce((a, b) => a + b, 0);
    let avg = sum / groupedData[year].length;
    returnData[year] = avg;
  }
  return returnData;

}

// Do the plot here
function plotBar(data, barTotalWidth = 650, barTotalHeight = 400, animationDelay = 1000) {

  let barMargin = { top: 30, right: 30, bottom: 40, left: 100 },
    barWidth = barTotalWidth - barMargin.left - barMargin.right,
    barHeight = barTotalHeight - barMargin.top - barMargin.bottom;

  yearScores = getBarData(data, "metascore");


  const years = Object.keys(yearScores);
  const avgScores = Object.values(yearScores);

  svg = d3.select("#barplot")
    .append("svg")
    .attr("width", barTotalWidth)
    .attr("height", barTotalHeight + 40);


  // Append a select element to the barplot div
  let scoreSelect = d3.select("#barplot").append("select")
    .attr("id", "scoreSelect")
    .style("position", "relative")
    .style("right", "-250px") // adjust as needed
    .style("top", "-425px"); // adjust as needed

  // Append option elements to the select element

  scoreSelect.append("option")
    .attr("value", "metascore")
    .text("Metascore");

  scoreSelect.append("option")
    .attr("value", "rotten_tomatoes")
    .text("Rotten Tomatoes");

  scoreSelect.append("option")
    .attr("value", "imdb")
    .text("IMDB");

  let x = d3.scaleBand()
    .domain(years)
    .range([barMargin.left, barTotalWidth - barMargin.right]);

  let y = d3.scaleLinear()
    .domain([0, 100])
    .range([barTotalHeight - barMargin.bottom, barMargin.top]);



  let bars = svg.selectAll("rect")
    .data(years)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d))
    .attr("y", (d) => y(yearScores[d]))
    .attr("width", x.bandwidth())
    .attr("height", (d) => y(0) - y(yearScores[d]))
    .attr("fill", "#69b3a2")
    .on("mouseover", function (d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html("Year: " + d + "<br/>" + "Avg. Score: " + yearScores[d])
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

    // Assuming x is your scale and data is your dataset
  let minYear = d3.min(data, function(d) { return d.year; });
  let maxYear = d3.max(data, function(d) { return d.year; });

  // Generate an array of years from minYear to maxYear, stepping by 5 years
  let tickValues = d3.range(minYear, maxYear + 1, 5);

  // Add X axis
  let xAxis = d3.axisBottom(x).tickValues(tickValues);

  // Add X and Y axis
  svg.append("g")
    .attr("transform", `translate(0, ${barTotalHeight - barMargin.bottom})`)
    .call(xAxis) // use numTicks as argument to ticks()
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
    .attr("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Critics' Score Evolution");

  svg.append("text")
    .attr("x", barMargin.top)
    .attr("y", barMargin.left - 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .text("Average Score")
    .attr("transform", "rotate(-90, 0, 0) translate(-" + (barTotalHeight / 2) + ", -20)");

  svg.append("text")
    .attr("x", barMargin.left + barWidth / 2)
    .attr("y", barMargin.bottom + barHeight + 40)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .text("Year");


  document.getElementById('scoreSelect').addEventListener('change', function () {
    console.log("UPDATEBARS")
    let scoreSelect = d3.select("#scoreSelect").node().value;
    console.log(scoreSelect);
    let newAverageData = getBarData(data, scoreSelect);
    // Initialize all years to 0
    let allYearsData = {};
    for (let year = 1900; year <= new Date().getFullYear(); year++) {
      allYearsData[year] = 0;
    }
  
    // Update the years present in newAverageData
    for (let year in newAverageData) {
      allYearsData[year] = newAverageData[year];
    }
  
    // Update the bars
    bars.attr("x", (d) => x(d))
      .attr("y", (d) => y(yearScores[d]))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(yearScores[d]))
      .transition()
      .duration(animationDelay)
      .attr("x", (d) => x(d))
      .attr("y", (d) => y(allYearsData[d]))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(allYearsData[d]));
      
  
    yearScores = allYearsData;
  });

  function updateBar(data) {
    console.log("UPDATEBARS")
    let scoreSelect = d3.select("#scoreSelect").node().value;
    console.log(scoreSelect);
    let newAverageData = getBarData(data, scoreSelect);
    // Initialize all years to 0
    let allYearsData = {};
    for (let year = 1900; year <= new Date().getFullYear(); year++) {
      allYearsData[year] = 0;
    }
  
    // Update the years present in newAverageData
    for (let year in newAverageData) {
      allYearsData[year] = newAverageData[year];
    }
  
    // Update the bars
    bars.attr("x", (d) => x(d))
      .attr("y", (d) => y(yearScores[d]))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(yearScores[d]))
      .transition()
      .duration(animationDelay)
      .attr("x", (d) => x(d))
      .attr("y", (d) => y(allYearsData[d]))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(allYearsData[d]));
      
  
    yearScores = allYearsData;
  }
  updateBar(data);

  return updateBar;


}


