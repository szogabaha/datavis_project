let scatterTotalWidth = 600, scatterTotalHeight = 400;
let margin = { top: 30, right: 30, bottom: 40, left: 100 },
    scatterWidth = scatterTotalWidth - margin.left - margin.right,
    scatterHeight = scatterTotalHeight - margin.top - margin.bottom;

// Map data to the needs of the chart, groupby etc
function getScatterScoreData(data) {

    data = data.filter(d => d.selected);

    data.forEach(d => {
        d.imdb = Number(d["imdb"]);
        d.metascore = Number(d["metascore"]);
        //d.rotten_tomatoes = Number(d["rotten_tomatoes"]);
    });

    // remove data items with no score
    data = data.filter(d => !isNaN(d.imdb) && !isNaN(d.metascore));
    // remove data items with zero score
    data = data.filter(d => d.imdb > 0 && d.metascore > 0);

    return data;
}

// Obj, all data that the updateEx1Chart function needs
var EX1_CONFIG = null;

// Update the chart according to some request
// Receives the filtered data!
function updateScatterScore(data) {
    const transformedData = getScatterScoreData(data);
    //Do the transition here using EX1_CONFIG + transformedData

    // Define scales based on the new data
    let x = d3.scaleLinear()
        .domain([d3.min(transformedData, d => d.imdb), d3.max(transformedData, d => d.imdb)])
        .range([0, scatterWidth]);
    let y = d3.scaleLinear()
        .domain([d3.min(transformedData, d => d.metascore), d3.max(transformedData, d => d.metascore)])
        .range([scatterHeight, 0]);
    var color = d3.scaleLinear()
        .domain([d3.min(transformedData, d => d.revenue), 0, (d3.max(transformedData, d => d.revenue))/8, (d3.max(transformedData, d => d.revenue))/4 , d3.max(transformedData, d => d.revenue)])
        .range(["red", "orange", "yellow", "green", "blue"]);

    // Select the circles and bind the new data
    let circles = d3.select("#scatterplot_score").selectAll("circle").data(transformedData);

    // Use the general update pattern to handle the enter, update, and exit selections
    circles.enter().append("circle")
        .attr("r", 5)
        .attr("opacity", 0.7)
        .merge(circles) // Merges the enter and update selections
        .transition() // Initiates a transition
        .duration(1000) // Specifies the duration
        .attr("cx", d => x(d.imdb))
        .attr("cy", d => y(d.metascore))
        .attr("fill", d => color(d.revenue));

    // Transition the exiting circles to have zero radius and then remove them
    circles.exit()
        .transition()
        .duration(800)
        .attr("r", 0)
        .remove();
}

// Do the plot here
function plotScatterScore(data, scatterTotalWidth = 600, scatterTotalHeight = 400, animationDelay = 2000) {

    const transformedData = getScatterScoreData(data)

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
        .attr("y", 10 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .attr("font-size", "25px")
        .style("text-decoration", "underline")
        .text("Audience vs Critic Score");
    
    // add x axis
    let x = d3.scaleLinear()
        .domain([d3.min(scoreData, d => d.imdb), d3.max(scoreData, d => d.imdb)])
        .range([0, scatterWidth]);
    g.append("g")
        .attr("transform", "translate(0," + scatterHeight + ")")
        .call(d3.axisBottom(x));

    // add x axis label
    g.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .text("Audience: IMDB Score");

    // add y axis
    let y = d3.scaleLinear()
        .domain([d3.min(scoreData, d => d. metascore), d3.max(scoreData, d => d.metascore)])
        .range([scatterHeight, 0]);
    g.append("g")
        .call(d3.axisLeft(y));

    // add y axis label
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 30)
        .attr("x", 0 - (scatterHeight / 2))
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .style("text-anchor", "middle")
        .text("Critics: Metascore");

    // define colourscale
    var color = d3.scaleLinear()
        .domain([d3.min(scoreData, d => d.revenue), 0, (d3.max(scoreData, d => d.revenue))/8, (d3.max(scoreData, d => d.revenue))/4 , d3.max(scoreData, d => d.revenue)])
        .range(["red", "orange", "yellow", "green", "blue"]);

    // create scatterplot
    g.selectAll("dot")
        .data(scoreData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.imdb))
        .attr("cy", d => y(d.metascore))
        .attr("r", 5)
        .attr("opacity", 0.7)
        .attr("fill", d => color(d.revenue)) // change color based on Revenue
        .on("mouseover", function (d) {
            d3.select(this).attr('stroke', 'black').attr('stroke-width', 2); // Add black outline
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.title + '<br/>' + 'Audience: ' + d.imdb + "<br/>" + 'Critics: ' + d.metascore)
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        }).on("mouseout", function (d) {
            d3.select(this).attr('stroke', 'none'); // Remove black outline
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


