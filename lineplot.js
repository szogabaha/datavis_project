let revenuePath
let revenueArray
let line

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
      acc[item.year] = { "Revenues": [], "RunningTimes": [] };
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

  return [revenueData, runningTimeData];
}

function updateLine(data) {
  let [newRevenueData, newRunningTimeData] = getLineData(data);
  const newRevenueArray = Object.entries(newRevenueData).map(([year, revenue]) => ({ year: parseInt(year), revenue }));
    
}


function plotLine(data, width = 1000, height = 400, animationDelay = 2000) {

  let [revenueData, runningTimeData] = getLineData(data);
  console.log(revenueData)
  console.log(runningTimeData)

  // Convert revenueData object to an array of objects for easier use with D3
  revenueArray = Object.entries(revenueData).map(([year, revenue]) => ({ year: parseInt(year), revenue }));

  // Set up the SVG container
  const svg = d3.select('#lineplot') // Select the body element or use an existing container
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Set margins and dimensions for the chart
  const margin = { top: 20, right: 30, bottom: 60, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create scales for x and y axes
  const x = d3.scaleLinear()
    .domain(d3.extent(revenueArray, d => d.year))
    .range([margin.left, innerWidth + margin.left]);

  const y = d3.scaleLinear()
    .domain([d3.min(revenueArray, d => d.revenue), d3.max(revenueArray, d => d.revenue)])
    .nice()
    .range([innerHeight + margin.top, margin.top]);

  // Define the line function
  line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.revenue));

  // Append the line to the chart
  revenuePath = svg.append('path')
    .datum(revenueArray)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 5)
    .attr('d', line);


  revenueCircles = svg.selectAll('circle')
    .data(revenueArray)
    .enter()
    .append('circle')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.revenue))
    .attr('r', 2.5)
    .on('mouseover', (d) => {
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(`Revenue: ${d.revenue}`)
        .style('left', `${d3.event.pageX}px`)
        .style('top', `${d3.event.pageY - 28}px`);
    })
    .on('mousemove', (d) => {
      tooltip.style('left', `${d3.event.pageX}px`)
        .style('top', `${d3.event.pageY - 28}px`);
    })
    .on('mouseout', (d) => {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    });

  // Create x-axis
  svg.append('g')
    .attr('transform', `translate(0, ${innerHeight + margin.top})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')));

  // Create y-axis
  svg.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

  // Add labels
  svg.append('text')
    .attr('transform', `translate(${width / 2}, ${height - margin.bottom / 2})`)
    .style('text-anchor', 'middle')
    .attr("font-size", "20px")
    .text('Year');

  svg.append('text')
    .attr('transform', `rotate(-90) translate(${(-height / 2)+30}, ${margin.left / 6})`)
    .style('text-anchor', 'middle')
    .attr("font-size", "20px")
    .text('Revenue');


  const legendColor = 'steelblue';
  const legendLabel = 'Revenue';

  // Append a `g` element to the SVG to contain the legend




  // Convert runningTimeData object to an array of objects for easier use with D3
  const runningTimeArray = Object.entries(runningTimeData).map(([year, runningTime]) => ({ year: parseInt(year), runningTime }));

  // Create a new scale for the y-axis using runningTimeData
  const y2 = d3.scaleLinear()
    .domain([0, d3.max(runningTimeArray, d => d.runningTime)])
    .nice()
    .range([innerHeight + margin.top, margin.top]);

  // Define the line function for runningTimeData
  const line2 = d3.line()
    .x(d => x(d.year))
    .y(d => y2(d.runningTime));

  // Draw the line for runningTimeData on the SVG container
  runningTimePath = svg.append('path')
    .datum(runningTimeArray)
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-width', 2.5)
    .attr('d', line2);

  // Create and draw the new y-axis on the right side of the plot
  svg.append('g')
    .attr('transform', `translate(${innerWidth + margin.left},0)`)
    .call(d3.axisRight(y2));
  const legend = svg.append('g')
    .attr('transform', `translate(${margin.right + 80}, ${margin.top - 10})`);

  // Append a `rect` element to represent the color
  legend.append('rect')
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', legendColor);

  // Append a `text` element to display the label
  legend.append('text')
    .attr('x', 24)
    .attr('y', 9)
    .attr('dy', '.35em')
    .style('text-anchor', 'start')
    .attr("font-size", "20px")
    .text(legendLabel);

  const legend2 = svg.append('g')
    .attr('transform', `translate(${margin.right + 80}, ${margin.top + 10})`);

  // Append a `rect` element to represent the color of runningTimeData
  legend2.append('rect')
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', 'red');

  // Append a `text` element to display the label of runningTimeData
  legend2.append('text')
    .attr('x', 24)
    .attr('y', 9)
    .attr('dy', '.24em')
    .style('text-anchor', 'start')
    .attr("font-size", "20px")
    .text('Running Time');

  // Append a `g` element for each data point in runningTimeData
  const circles = svg.selectAll('.dot')
    .data(runningTimeArray)
    .enter().append('g');

  // Append a circle to each `g` element
  circles.append('circle')
    .attr('class', 'dot')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y2(d.runningTime))
    .attr('r', 3);
  // Add a mouseover event to each circle to display a tooltip
  circles.on('mouseover', function (d) {
    tooltip.transition()
      .duration(200)
      .style('opacity', .9);
    tooltip.html(`Year: ${d.year}<br/>Running Time: ${d.runningTime}`)
      .style('left', (d3.event.pageX + 5) + 'px')
      .style('top', (d3.event.pageY - 28) + 'px');
  });

  // Add a mouseout event to each circle to hide the tooltip
  circles.on('mouseout', function (d) {
    tooltip.transition()
      .duration(500)
      .style('opacity', 0);
  });

  function updateDataSelection() {
    var extent = d3.brushSelection(this);
    console.log(extent);
    if (extent != null) {
      selection = extent.map(x.invert).map(Math.round);
      console.log(selection);
      //set attribute linePlotSelected of items of data that year is within selection
      data.forEach(d => {
        //"Release date": "1937-05-19"
        const date = new Date(d["Release date"]);
        const year = date.getFullYear();
        if (year >= selection[0] && year <= selection[1]) {
          d["linePlotSelected"] = true;
        } else {
          d["linePlotSelected"] = false;
        }
      });
    }
    else {
      //if no selection revert to all selected
      data.forEach(d => {
        d["linePlotSelected"] = true;
      });
    }
    updateCharts(data);
  }

  var brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on("end", updateDataSelection);

  svg.append("g")
    .attr("class", "brush")
    .call(brush);

  svg.append("text")
    .attr("x", 40+(width / 2))
    .attr("y", margin.top)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Critics' Score Evolution");

}

