 

//main DOM element, use this as starting point in all plot scripts
const SVG = d3.select("#chart-area").append("svg")
    .attr("width", 2000)
    .attr("height", 2000);

d3.csv("source.csv").then(data =>{
    
    
    // Add filterind fields + masks,
    // all of them are true -> Show all data in the beginning
    // each ex1, ex2 etc.. refer to the filter mask of a specific chart
    data.map(d => {
        //d["ex1Selected"] = true;
        //d["ex2Selected"] = true;
        //...
        d["selected"] = true; //This is ex1 & ex2 & ex3 mask concat, all are true when starting 
    })

    //call plots here
    //TODO, collect these parameters and inject them or hardwire inside? 
    plotExample1(ex1Left, ex1Top, ex1TotalWidth, ex1TotalHeight, ex1Margin, data);
    //plotBar(barLeft, barTop, barTotalWidth, barTotalHeight, barMargin, data);
    //..
}).catch(function(error){
    console.log(error);
});



// Transition view into the updated state
// UpdatedSelection is the original data with modified filter flags
function updateCharts(updatedSelection) {
    updatedSelection.map(x => x.selected = x.ex1Selected); // && ex2Selected && ex3Selected ...);
    updateEx1(updatedSelection);
    //updateEx2(updatedSelection);
    //...
}
