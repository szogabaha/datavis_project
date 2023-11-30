// Map data to the needs of the chart, groupby etc
function getBarData(data, scorekind = "rotten_tomatoes") {

  // get only those that have the field "selected" to true
  data = data.filter(d => d.selected);

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
  return averageData;

}

function updateBar(data) {
  const transformedData = getBarData(data);
  //TODO: For when I have an interactible that changes the filtered data
}

// Do the plot here
function plotBar(data, barTotalWidth = 1000, barTotalHeight = 400, animationDelay = 2000) {
  
  let barMargin = { top: 30, right: 30, bottom: 40, left: 100 },
  barWidth = barTotalWidth - barMargin.left - barMargin.right,
  barHeight = barTotalHeight - barMargin.top - barMargin.bottom;

  let yearScores = getBarData(data, "metascore");


  const years = Object.keys(yearScores);
  const avgScores = Object.values(yearScores);

  const svg = d3.select("#barplot")
    .append("svg")
    .attr("width", barTotalWidth)
    .attr("height", barTotalHeight);


  // Append a select element to the barplot div
  let scoreSelect = d3.select("#barplot").append("select")
      .attr("id", "scoreSelect")
      .style("position", "relative")
      .style("left", "-" + 150 +  "px") // adjust as needed
      .style("top", "-" + (barTotalHeight-30) +  "px"); // adjust as needed

  // Append option elements to the select element
  scoreSelect.append("option")
      .attr("value", "rotten_tomatoes")
      .text("Rotten Tomatoes");

  scoreSelect.append("option")
      .attr("value", "imdb")
      .text("IMDB");

  scoreSelect.append("option")
      .attr("value", "metascore")
      .text("Metascore");

  const x = d3.scaleBand()
    .domain(years)
    .range([barMargin.left, barTotalWidth - barMargin.right]);

  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([barTotalHeight - barMargin.bottom, barMargin.top]);



  svg.selectAll("rect")
    .data(years)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d))
    .attr("y", (d) => y(yearScores[d]))
    .attr("width", x.bandwidth())
    .attr("height", (d) => y(0) - y(yearScores[d]))
    .attr("fill", "#69b3a2")
    .on("mouseover", function(d) {
      tooltip.transition()
          .duration(200)
          .style("opacity", .9);
          tooltip.html("Year: " + d + "<br/>" + "Avg. Score: " + yearScores[d].toFixed(2))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
  })
  .on("mouseout", function(d) {
      tooltip.transition()
          .duration(500)
          .style("opacity", 0);
  });


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
    .text("Critics' Score Evolution");

  svg.append("text")
    .attr("x", barMargin.top)
    .attr("y", barMargin.left - 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text("Average Score")
    .attr("transform", "rotate(-90, 0, 0) translate(-" + (barTotalHeight / 2) + ", -10)");

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


    // Use the .enter() method to create new bars for any new data
    bars.enter().append("rect")
      .attr("x", (d) => x(d))
      .attr("width", x.bandwidth())
      .attr("fill", "#69b3a2");

    // Update the y attribute and height of all bars (both existing and new)
    // Add a transition to animate the height change
    bars.attr("x", (d) => x(d))
      .attr("y", (d) => y(yearScores[d]))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(yearScores[d]))
      .transition()
      .duration(animationDelay)
      .attr("x", (d) => x(d))
      .attr("y", (d) => y(averageData[d]))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(averageData[d]));
    
    yearScores = averageData;
    });




}


