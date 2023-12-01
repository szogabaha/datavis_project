// set position of plot
const scatter_scoreDiv = document.getElementById("scatterplot_score");
scatter_scoreDiv.style.position = "relative";
scatter_scoreDiv.style.left = 1000 + "px"; // adjust as needed
scatter_scoreDiv.style.top = -350 + "px"; // adjust as needed

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
function plotScatterScore(data, scatterTotalWidth = 600, scatterTotalHeight = 400, animationDelay = 2000) {

    const transformedData = getScatterScoreData(data)

    let margin = { top: 30, right: 30, bottom: 40, left: 100 },
    scatterWidth = scatterTotalWidth - margin.left - margin.right,
    scatterHeight = scatterTotalHeight - margin.top - margin.bottom;

    let scoreData = getScatterScoreData(data);

    const svg = d3.select("#scatterplot_score")
        .append("svg")
        .attr("width", scatterTotalWidth)
        .attr("height", scatterTotalHeight)

    const g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add title
    g.append("text")
        .attr("x", (scatterWidth / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Audience vs Critic Score");
    
    // add x axis
    let x = d3.scaleLinear()
        .domain([0, d3.max(scoreData, d => d.imdb)])
        .range([0, scatterWidth]);
    g.append("g")
        .attr("transform", "translate(0," + scatterHeight + ")")
        .call(d3.axisBottom(x));

    // add x axis label
    g.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + margin.bottom)
        .attr("text-anchor", "middle")
        .text("IMDB Score");

    // add y axis
    let y = d3.scaleLinear()
        .domain([0, d3.max(scoreData, d => d.metascore)])
        .range([scatterHeight, 0]);
    g.append("g")
        .call(d3.axisLeft(y));

    // add y axis label
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (scatterHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Metascore");

    // create scatterplot
    g.selectAll("dot")
        .data(scoreData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.imdb))
        .attr("cy", d => y(d.metascore))
        .attr("r", 5)
        .attr("opacity", 0.7)
        .style("fill", "#69b3a2")
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html('Audience: ' + d.rotten_tomatoes + "<br/>" + 'Critics: ' + d.metascore)
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        }).on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


  //Store everything here that the update will need
  // EX1_CONFIG = {
  //   "xTick": xTick,
  //   "yTick": yTick,
  //   "barHeight": barHeight
  // }

}


