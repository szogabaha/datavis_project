// set position of plot
const scatterDiv = document.getElementById("scatterplot_money");
scatterDiv.style.position = "relative";
scatterDiv.style.left = 1000 + "px"; 
scatterDiv.style.top = -400 + "px"; 

// Map data to the needs of the chart, groupby etc
function getScatterMoneyData(data) {

    data = data.filter(d => d.selected);

    data.forEach(d => {
        d.budget = Number(d["Budget"]);
        d.box_office = Number(d["Box office"]);
        d.revenue = Number(d["Revenue"]);
    });
    // remove data items with no value
    data = data.filter(d => !isNaN(d.budget) && !isNaN(d.box_office) && !isNaN(d.revenue));
    // remove data items with zero value
    data = data.filter(d => d.budget > 0 && d.box_office > 0);
    
    return data;
}

// Obj, all data that the updateEx1Chart function needs
var EX1_CONFIG = null;

// Update the chart according to some request
// Receives the filtered data!
function updateScatterMoney(data) {
    const transformedData = getScatterMoneyData(data);
    //Do the transition here using EX1_CONFIG + transformedData
}

// Do the plot here
function plotScatterMoney(data, scatterTotalWidth = 600, scatterTotalHeight = 400, animationDelay = 2000) {

    const transformedData = getScatterMoneyData(data)

    let margin = { top: 30, right: 30, bottom: 40, left: 100 },
    scatterWidth = scatterTotalWidth - margin.left - margin.right,
    scatterHeight = scatterTotalHeight - margin.top - margin.bottom;

    let moneyData = getScatterMoneyData(data);

    const svg = d3.select("#scatterplot_money")
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
        .text("Budget vs Box Office");
    
    // add x axis
    let x = d3.scaleLinear()
        .domain([0, d3.max(moneyData, d => d.budget)])
        .range([0, scatterWidth]);
    g.append("g")
        .attr("transform", "translate(0," + scatterHeight + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format(".2s")));

    // add x axis label
    g.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + margin.bottom)
        .attr("text-anchor", "middle")
        .text("Budget");

    // add y axis
    let y = d3.scaleLinear()
        .domain([0, d3.max(moneyData, d => d.box_office)])
        .range([scatterHeight, 0]);
    g.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));
    
    // add y axis label
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (scatterHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Box Office");
    
    // create scatterplot
    g.selectAll("circle")
        .data(moneyData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.budget))
        .attr("cy", d => y(d.box_office))
        .attr("r", 5)
        .attr("opacity", 0.7)
        .attr("fill", d => d.revenue > 0 ? "green" : "red") // change color based on Revenue
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.title + '<br/>' + 'Revenue: ' + "<br/>" + d.revenue.toLocaleString() + "$")
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


