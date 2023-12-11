// TODO add these to global repo
FONT_SIZE = 14;
TRANSITION_TIME = 2000;

// Global variables collected, related to this chart
var PIECOUNTRIES_CONFIG = null;


// Click on pie slice or legend part, to deselect countries
// Update deselect list and the model, then call the controller.
// If the clicked country is not deselected, deselect it, otherwise remove from filters
function clickOnItem(event, data) {

	if (!PIECOUNTRIES_CONFIG.deselectedCountries.includes(event.country)) {
		PIECOUNTRIES_CONFIG.deselectedCountries.push(event.country);

	} else {
		PIECOUNTRIES_CONFIG.deselectedCountries = PIECOUNTRIES_CONFIG.deselectedCountries.filter(x => x !== event.country);
	}

	data.map(e => {
		const remainingCountries = getCountryFromObject(e).filter(remaining => !PIECOUNTRIES_CONFIG.deselectedCountries.includes(remaining))
		e["pieSelected"] = remainingCountries.length !== 0;
	});

	updateCharts(data);

}

// Parse string to list of countries
function getCountryFromObject(obj) {
	try {
		const countryArray = JSON.parse(obj.Country.replace(/'/g, '"'));
		return countryArray;
	}
	catch (error) { //Country field is not an array, parse it as a string
		return [obj.Country == "" ? "Unknown" : obj.Country]
	}
}

// Input: raw data
// Output: [ Obj {country, count, selectedCount}]
// selectedCount is cropped to 0 if the country is deselected in this top
// (to avoid having a country in the plot if we deselected it because of another movie)
function getPieCountriesData(data) {

	unsorted = data.reduce((acc, obj) => {


		const countries = getCountryFromObject(obj);
		countries.forEach(e => {
			const existingObject = acc.find(accItem => accItem.country === e);

			// we only show countries that are not filtered out by other plots (obj.selected) and by this
			// (second part of the expression)
			const showInThisPlot = obj.selected && !PIECOUNTRIES_CONFIG?.deselectedCountries.includes(e);
			if (existingObject) {
				existingObject.count++;
				if (showInThisPlot) {
					existingObject.selectedCount++;
				}
			} else {
				const newObj = { country: e, count: 1, selectedCount: showInThisPlot ? 1 : 0 };
				acc.push(newObj);
			}
		});

		return acc;
	}, []);

	sorted = unsorted.sort((a, b) => b.count - a.count);
	return sorted;
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

	// set deselected country legends to grey
	PIECOUNTRIES_CONFIG["legend"].selectAll("text")
		.style('fill', "black") // Reset to black
		.filter((d, i) => PIECOUNTRIES_CONFIG.deselectedCountries.includes(d.country))
		.style('fill', "grey"); // Set deselected to grey

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
		.attr('width', width + 155)
		.attr('height', height);

	const radius = Math.min(innerWidth, innerHeight) / 2;
	const transformedData = getPieCountriesData(data);

	const g = svg.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`)


	// Title
	svg.append("text")
		.attr("x", 50 + (width / 2))
		.attr("y", margin.top)
		.attr("text-anchor", "middle")
		.attr("font-size", 24)
		.style("text-decoration", "underline")
		.text("Countries");

	let pie = d3.pie().sort((a, b) => (b.count - a.count));

	var arcGenerator = d3.arc()
		.innerRadius(0.001)
		.outerRadius(radius);

	// There is no 20 colored discrete colormap prepared
	let color = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3',
		'#e41a1c', '#dede00', '#7a7a7a', '#ffae42',
		'#5e3c99', '#2ca02c', '#d62728', '#9467bd',
		'#8c564b', '#1f77b4', '#bcbd22', '#17becf',
		'#FF69B4', '#00FA9A', '#FFD700']);


	let path = g.selectAll('path')
		.data(pie(transformedData.map(x => x.count)))
		.enter()
		.append('path')
		.attr("transform", `translate(${innerWidth / 2}, ${radius + margin.top})`)
		.attr('d', arcGenerator)
		.attr('fill', (d, i) => color(i))
		.on('click', (d, i) => clickOnItem(transformedData[i], data))
		// Tooltip from here
		.on("mouseover", (d, i) => {
			tooltip.transition()
				.duration(400)
				.style("opacity", .9);
			tooltip.html("Country: " + transformedData[i].country + "<br/>" + "Num. of movies: " + transformedData[i].selectedCount)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout", d => {
			tooltip.transition()
				.duration(500)
				.style("opacity", 0);
		});

	// Legend
	const legend = g
		.append('g')
		.attr('transform', `translate(${innerWidth / 2 + radius + 15}, ${radius})`);

	// Legend colorboxes
	legend.append('g')
		.selectAll("rect")
		.data(transformedData)
		.enter()
		.append('rect')
		.attr('id', d => d.country)
		.attr('x', (d, i) => i < 9 ? 0 : FONT_SIZE * 10) //Two column
		.attr('y', (d, i) => (FONT_SIZE * (i % 9) * 1.8))
		.attr('width', FONT_SIZE)
		.attr('height', FONT_SIZE)
		.attr('fill', (d, i) => color(i))
		.attr('stroke', 'black')
		.style('stroke-width', '1px')
		.on('click', d => clickOnItem(d, data));

	// Legend labels
	legend
		.selectAll('text')
		.data(transformedData)
		.enter()
		.append('text')
		.attr('id', d => d.country)
		.attr("cursor", "default")
		.text(d => d.country)
		// Two columns. different from colorbox settings since the text is written from bottom left
		.attr('x', (d, i) => i < 9 ? FONT_SIZE * 1.4 : FONT_SIZE * 11.4)
		.attr('y', (d, i) => FONT_SIZE * (i % 9) * 1.8 + FONT_SIZE - 2)
		.style('font-size', `${FONT_SIZE}px`)
		.on('click', d => clickOnItem(d, data));


	PIECOUNTRIES_CONFIG = {
		"pie": pie,
		"arcGenerator": arcGenerator,
		"sections": path,
		"legend": legend,
		"deselectedCountries": deselectedCountries,
		"color": color
	}
}