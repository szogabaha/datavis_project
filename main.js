

//main DOM element, use this as starting point in all plot scripts
const SVG = d3.select("#chart-area").append("svg")
    .attr("width", 2000)
    .attr("height", 2000);


var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("text-align", "center")
    .style("padding", "2px")
    .style("font", "12px sans-serif")
    .style("background", "lightsteelblue")
    .style("border", "0px")
    .style("border-radius", "8px")
    .style("pointer-events", "none");

d3.csv("data/walt_disney_movies.csv").then(data => {

    // Remove columns form dataset: Based on, Distributed By, Language, Production Company, Starring
    data.forEach(d => {
        delete d["Based on"];
        delete d["Distributed by"];
        delete d["Language"];
        delete d["Production company"];
        delete d["Starring"];
    });

    // Add filterind fields + masks,
    // all of them are true -> Show all data in the beginning
    // each ex1, ex2 etc.. refer to the filter mask of a specific chart
    data.map(d => {
        d["linePlotSelected"] = true;
        //d["ex2Selected"] = true;
        //...
        d["selected"] = true; //This is ex1 & ex2 & ex3 mask concat, all are true when starting 
    })

    data.forEach(d => {
        if (d["Box office"] && d["Budget"]) {
            d["Revenue"] = d["Box office"] - d["Budget"];
        } else {
            d["Revenue"] = "";
        }
    });

    console.log(data)
    //call plots here
    //TODO, collect these parameters and inject them or hardwire inside? 
    plotExample1(data);
    plotLine(data);
    plotBar(data);
    plotScatterMoney(data);
    plotScatterScore(data);
    //..
}).catch(function (error) {
    console.log(error);
});

// Transition view into the updated state
// UpdatedSelection is the original data with modified filter flags
function updateCharts(updatedSelection) {
    updatedSelection.map(x => x.selected = x.linePlotSelected); // && ex2Selected && ex3Selected ...);
    updateEx1(updatedSelection);
    updateBar(updatedSelection);
    updateLine(updatedSelection);
    updateScatterMoney(updatedSelection);
    updateScatterScore(updatedSelection);
    //...
}
