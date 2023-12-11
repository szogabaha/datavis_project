
FONT_SIZE = 14;
TRANSITION_TIME = 2000;
// Obj, all data that the updateEx1Chart function needs
var PIECOUNTRIES_CONFIG = null;

function clickOnLegend(event, data) {
    PIECOUNTRIES_CONFIG.deselectedCountries.push(event.country);
    data.map(e => {
        const remainingCountries = getCountryFromObject(e).filter(remaining => !PIECOUNTRIES_CONFIG.deselectedCountries.includes(remaining))
        e["pieSelected"] = remainingCountries.length !== 0;
    });

    updateCharts(data);

}

function getCountryFromObject(obj) {
    try {
        const countryArray = JSON.parse(obj.Country.replace(/'/g, '"'));
        return countryArray;
    }
    catch (error) { //Country field is not an array, parse it as a string
        return [obj.Country == "" ? "Unknown": obj.Country]
    }
}

function getPieCountriesData(data) {

    //////////////////
    // Use reduce to transform the array
    unsorted = data.reduce((acc, obj) => {
        const countries = getCountryFromObject(obj);
        countries.forEach(e => {
            const existingObject = acc.find(accItem => accItem.country === e);
            if (existingObject) {
                existingObject.count++;
                if (obj.selected && !PIECOUNTRIES_CONFIG?.deselectedCountries.includes(e)) {
                    existingObject.selectedCount++;
                }
            } else {
                const newObj = { country: e, count: 1, selectedCount: obj.selected ? 1 : 0 };
                acc.push(newObj);
            }
        });

        return acc;
    }, []);

    sorted = unsorted.sort((a, b) => b.selectedCount - a.selectedCount);

    // Keep the first 4 items and create a "merged" element for the rest
    const topFour = unsorted.slice(0, 4);
    const rest = unsorted.slice(4);

    // Calculate the sum of counts for the remaining elements
    const sumOfRestCounts = rest.reduce((sum, obj) => sum + obj.count, 0);

    // Create the "merged" element
    const otherElement = { country: 'Other', count: sumOfRestCounts, selectedCount: rest.reduce((sum, obj) => sum + obj.selectedCount, 0) };
    console.log(topFour)
    // Concatenate the top four and the "merged" element
    const result = topFour.concat(otherElement).filter(x => x.selectedCount !== 0);
    return result;
}




// Update the chart according to some request
// Receives the filtered data!
function updatePieCountries(data) {
    updatedData = getPieCountriesData(data);
    let oldAngles = PIECOUNTRIES_CONFIG["sections"].data();

    PIECOUNTRIES_CONFIG["sections"]
        .data(PIECOUNTRIES_CONFIG["pie"](updatedData.map(x => x.selectedCount)))
        .transition()
        .duration(TRANSITION_TIME)
        .attrTween('d', function (d) {
            let starti = d3.interpolate(oldAngles[d.index].startAngle, d.startAngle);
            let endi = d3.interpolate(oldAngles[d.index].endAngle, d.endAngle);
            return function (t) {
                d.startAngle = starti(t);
                d.endAngle = endi(t);
                return PIECOUNTRIES_CONFIG["arcGenerator"](d);
            }
        });

    PIECOUNTRIES_CONFIG.legend.selectAll('rect').remove();
    PIECOUNTRIES_CONFIG.legend.selectAll('rect').data(updatedData).enter().append('rect')
    .attr('id',d => d.country)
    .attr('y', (d, i) => FONT_SIZE * i * 1.8)
    .attr('width', FONT_SIZE)
    .attr('height', FONT_SIZE)
    .attr('fill', (d, i) => PIECOUNTRIES_CONFIG.color(i))
    .attr('stroke', 'black')
    .style('stroke-width', '1px')
    .on('click', d => clickOnLegend(d, data));


    PIECOUNTRIES_CONFIG.legend.selectAll('text').remove();
    PIECOUNTRIES_CONFIG.legend.selectAll('text').data(updatedData).enter().append('text')
    .attr('id', d => d.country)
    .text(d => d.country)
    .attr('x', FONT_SIZE * 1.4)
    .attr('y', (d, i) => FONT_SIZE * i * 1.8 + FONT_SIZE - 2)
    .style('font-size', `${FONT_SIZE}px`);
}

// Do the plot here
function plotPieCountries(data, width = 400, height = 400) {
    var deselectedCountries = [];

    // Set margins and dimensions for the chart
    const margin = { top: 45, right: 150, bottom: 0, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;


    // Set up the SVG container
    const svg = d3.select('#pieplot') // Select the body element or use an existing container
        .append('svg')
        .attr('width', width + 10)
        .attr('height', height);

    const radius = Math.min(innerWidth, innerHeight) / 2;
    const transformedData = getPieCountriesData(data);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)


    // Title
    //addLabel(g,"Education", innerWidth / 2, 0, false);

    let pie = d3.pie().sort((a,b) => (b.selectedCount - a.selectedCount));

    var arcGenerator = d3.arc()
        .innerRadius(5 * radius / 8)
        .outerRadius(radius);

    let color = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c']);

    let path = g.selectAll('path')
        .data(pie(transformedData.map(x => x.count)))
        .enter()
        .append('path')
        .attr("transform", `translate(${innerWidth / 2}, ${radius + margin.top})`)
        .attr('d', arcGenerator)
        .attr('fill', (d, i) => color(i));

    //Legend
    const legend = g
        .append('g')
        .attr('transform', `translate(${innerWidth / 2 + radius + 15}, ${radius})`);

    legend.append('g')
        .selectAll("rect")
        .data(transformedData)
        .enter()
        .append('rect')
        .attr('id',d => d.country)
        .attr('y', (d, i) => FONT_SIZE * i * 1.8)
        .attr('width', FONT_SIZE)
        .attr('height', FONT_SIZE)
        .attr('fill', (d, i) => color(i))
        .attr('stroke', 'black')
        .style('stroke-width', '1px')
        .on('click', d => clickOnLegend(d, data));

    legend
        .selectAll('text')
        .data(transformedData)
        .enter()
        .append('text')
            .attr('id', d => d.country)
            .text(d => d.country)
            .attr('x', FONT_SIZE * 1.4)
            .attr('y', (d, i) => FONT_SIZE * i * 1.8 + FONT_SIZE - 2)
            .style('font-size', `${FONT_SIZE}px`);


    PIECOUNTRIES_CONFIG = {
        "pie": pie,
        "arcGenerator": arcGenerator,
        "sections": path,
        "legend": legend,
        "deselectedCountries": deselectedCountries,
        "color": color
    }
}