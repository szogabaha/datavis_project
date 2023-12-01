

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
        .attr("y", 10 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .attr("font-size", "25px")
        .style("text-decoration", "underline")
        .text("Budget vs Box Office");
    
    // add x axis
    let x = d3.scaleLinear()
        .domain([0, d3.max(moneyData, d => d.budget)])
        .range([0, scatterWidth]);
    g.append("g")
        .attr("transform", "translate(0," + scatterHeight + ")")
        .call(d3.axisBottom(x).tickFormat(d => "$" + d3.format(".2s")(d)));

    // add x axis label
    g.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .text("Budget (million $)");

    // add y axis
    let y = d3.scaleLinear()
        .domain([0, d3.max(moneyData, d => d.box_office)])
        .range([scatterHeight, 0]);
    g.append("g")
        .call(d3.axisLeft(y).tickFormat(d => "$" + d3.format(".2s")(d)));
    
    // add y axis label
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 30)
        .attr("x", 0 - (scatterHeight / 2))
        .attr("dy", "1em")
        .attr("font-size", "20px")
        .style("text-anchor", "middle")
        .text("Box Office");

    // define colourscale
    var color = d3.scaleLinear()
        .domain([d3.min(moneyData, d => d.revenue), 0, (d3.max(moneyData, d => d.revenue))/8, (d3.max(moneyData, d => d.revenue))/4 , d3.max(moneyData, d => d.revenue)])
        .range(["red", "orange", "yellow", "green", "blue"]);

    // add legend title
    g.append("text")
        .attr("x", scatterWidth - 10)
        .attr("y", -15)
        .attr("text-anchor", "end")
        .style("font-size", "12px")
        .text("Revenue");
    
    // add legend
    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(100," + (i * 12 + 20) +")");

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", scatterWidth - 18)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", color);

    // helper function to format numbers
    function formatNumber(num) {
        if (num <= -1e6) {
            return "-$" + Math.abs((num / 1e6).toFixed(1)) + "M";
        } else if (num >= 1e6) {
            return "$" + (num / 1e6).toFixed(1) + "M";
        } else {
            return "$" + num;
        }
    }

    // draw legend text
    legend.append("text")
        .attr("x", scatterWidth - 24)
        .attr("y", 8)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .style("font-size", "10px")
        .text(d => formatNumber(d));
    
    // create scatterplot
    g.selectAll("circle")
        .data(moneyData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.budget))
        .attr("cy", d => y(d.box_office))
        .attr("r", 4)
        .attr("opacity", 0.7)
        .attr("fill", d => color(d.revenue)) // change color based on Revenue
        .on("mouseover", function (d) {
            d3.select(this).attr('stroke', 'black').attr('stroke-width', 2); // Add black outline
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.title + '<br/>' + 'Revenue: ' + "<br/> $" + d.revenue.toLocaleString())
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


