// TODO put this into the BUBBLE_CONFIG
FONT_SIZE = 14;
// global config for plot
var BUBBLE_CONFIG = null;
// EX: 22500000 => 22.5M, for tooltip
function formatMillions(revenue) {
	if (typeof revenue !== 'number') {
		return 'Invalid input';
	}

	if (Math.abs(revenue) >= 1e6) {
		const formattedRevenue = (revenue / 1e6).toFixed(1);
		return `${formattedRevenue}M`;
	}

	return revenue.toString();
};


// parse string representation to array
function getPeopleFromObject(str) {
	try {
		const array = JSON.parse(str.replace(/'/g, '"'));
		return array;
	}
	catch (error) { //It's not an array, parse it as a string
		return [str == "" ? "Unknown" : str]
	}
}

// use the given person to accumulate the received acc.
// Identifier of an object: name and position (since a name can be associated
// with more positions but we want 1-1 assoc)
function accumulatePerson(e, acc, obj, position) {
	{
		const existingObject = acc.find(accItem => accItem.name === e && accItem.position === position);
		if (existingObject) {
			existingObject.count++;
			existingObject.movies.push(obj.title)
			if (obj.selected) {
				existingObject.selectedCount++;
				// Only increase revenue if obj is selected.
				// Implicit filter
				existingObject.revenue += obj.revenue;
			}
		} else {
			const newObj = {
				name: e, count: 1,
				position: position,
				movies: [obj.title],
				revenue: obj.selected ? obj.revenue : 0.1,
				selectedCount: obj.selected ? 1 : 0
			};
			acc.push(newObj);
		}
	}
}


// Split the list by position, keep the revenue of the top N objects in each list
// and merge the result (result: a merged list of
// top N director, top N editor, top N musician, rest wont be represented)
function getTopRevenueObjects(data, N) {
	const topRevenueByPosition = data.reduce((result, item) => {
		const { position, revenue } = item;

		// Initialize an array for the position if not exists
		result[position] = result[position] || [];

		// Add the current item to the array for the position
		result[position].push(item);

		// Sort the array for the position by revenue in descending order
		result[position].sort((a, b) => b.revenue - a.revenue);

		// Keep only the top N items for each position
		// Implicit filter
		result[position].forEach((innerItem, idx) => {
			if (idx >= N) {
				result[position][idx].revenue = 0;
			}
		});
		return result;
	}, {});

	const mergedArray = Object.values(topRevenueByPosition).flat();
	return mergedArray;
}

// Map data to the needs of the chart, groupby etc
function getBubblePeopleData(data) {
	let unsorted = data.reduce((acc, obj) => {
		const directors = getPeopleFromObject(obj["Directed by"]);
		directors.forEach(e => accumulatePerson(e, acc, obj, "director"));
		const editors = getPeopleFromObject(obj["Edited by"]);
		editors.forEach(e => accumulatePerson(e, acc, obj, "editor"));
		const musicians = getPeopleFromObject(obj["Music by"]);
		musicians.forEach(e => accumulatePerson(e, acc, obj, "musician"));

		return acc;
	}, []);

	// Crop top N
	unsorted = getTopRevenueObjects(unsorted, 10);
	let sorted = unsorted.sort((a, b) => b.name - a.name);
	return sorted;
}

// Update the chart according to some request
// Receives the filtered data!
function updateBubblePeople(data) {
	// Generate new data
	const transformedData = getBubblePeopleData(data);
	const root = BUBBLE_CONFIG.pack(d3.hierarchy({ children: transformedData })
		.sum(d => d.revenue));

	// Update plot with new data 
	BUBBLE_CONFIG.bubbles.data(root.leaves());

	BUBBLE_CONFIG.bubbles
		.transition()
		.duration(1000)
		.attr("r", d => d.r)
		.attr("stroke", "black")
		.attr("stroke-width", d => `${BUBBLE_CONFIG.selectedPeople.map(x => x.name).includes(d.data.name) ? 5 : 0}`)
		.attr("transform", d => `translate(${d.x},${d.y})`);


}

// Do the plot here
function plotBubblePeople(data, width = 600, height = 500) {

	let selectedPeople = [];
	// Set margins and dimensions for the chart
	const margin = { top: 45, right: 50, bottom: 0, left: 20 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	const transformedData = getBubblePeopleData(data);
	// Set up the SVG container
	const svg = d3.select('#bubbleplot') // Select the body element or use an existing container
		.append('svg')
		.attr('width', width)
		.attr('height', height);


	// Title
	svg.append("text")
		.attr("x", (width / 2))
		.attr("y", margin.top - 20)
		.attr("text-anchor", "middle")
		.attr("font-size", 24)
		.style("text-decoration", "underline")
		.text("People vs Revenue");

	const color = d3.scaleOrdinal(d3.schemeCategory10);
	const pack = d3.pack()
		.size([innerWidth, innerHeight])
		.padding(3);

	const root = pack(d3.hierarchy({ children: transformedData })
		.sum(d => d.revenue));

	const node = svg.append("g")
		.attr("transform", d => `translate(${margin.left},${margin.top})`)
		.selectAll("circle")
		.data(root.leaves())
		.enter()
		.append("circle")
		.attr("fill", d => color(d.data.position))
		.attr("r", d => d.r)
		.attr("transform", d => `translate(${d.x},${d.y})`)
		.on('click', d => {

			// Object comparator
			isSelected = (x) => x.name == d.data.name && x.position == d.data.position;

			// if the clicked person is not added to the filters, add it, otherwise remove it
			if (BUBBLE_CONFIG.selectedPeople.filter(isSelected).length === 0) {
				BUBBLE_CONFIG.selectedPeople.push(d.data);
			} else {
				BUBBLE_CONFIG.selectedPeople = BUBBLE_CONFIG.selectedPeople.filter(x => !(isSelected(x)));
			}

			// Modify model according to the set filters
			data.forEach(e => e.bubbleSelected = BUBBLE_CONFIG.selectedPeople.length == 0 ||
				BUBBLE_CONFIG.selectedPeople.filter(sP => sP.movies.includes(e.title)).length != 0);

			// Change view
			updateCharts(data);
		})
		// Rest is tooltip
		.on("mouseover", (d, i) => {
			tooltip.transition()
				.duration(200)
				.style("opacity", .9);
			tooltip.html(d.data.name + "<br/>" + "Revenue: " + formatMillions(d.data.revenue))
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout", d => {
			tooltip.transition()
				.duration(500)
				.style("opacity", 0);
		});


	// add legend
	const legend = svg.append('g')
		.attr("class", "legend")
		.attr("transform", (d, i) => `translate(${innerWidth - 50},${margin.top})`);

	// Create legend data from the original dataset 
	// (discrete position values)
	const legendData = [...new Set(transformedData.map(d => d.position))];

	legend.append('g')
		.selectAll("rect")
		.data(legendData)
		.enter()
		.append('rect')
		.attr('y', (d, i) => (FONT_SIZE * i * 1.8))
		.attr('width', FONT_SIZE)
		.attr('height', FONT_SIZE)
		.attr('fill', (d, i) => color(d))
		.attr('stroke', 'black')
		.style('stroke-width', '1px')
		.on('click', d => { });

	legend.append('g')
		.selectAll('text')
		.data(legendData)
		.enter()
		.append('text')
		.attr("cursor", "default")
		.text(d => d)
		.attr('x', (d, i) => FONT_SIZE * 1.8)
		.attr('y', (d, i) => FONT_SIZE - 1 + 1.8 * FONT_SIZE * i)
		.style('font-size', `${FONT_SIZE}`)
		.on('click', d => { });

	BUBBLE_CONFIG = {
		"color": color,
		"bubbles": node,
		"root": root,
		"pack": pack,
		"selectedPeople": selectedPeople
	}
}


