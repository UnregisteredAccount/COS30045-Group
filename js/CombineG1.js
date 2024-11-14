// Show the pie chart initially
document.getElementById("chart").style.display = "block";
document.getElementById("pie-legend").style.display = "block";

const toggleChartButton = document.getElementById("toggleChartButton");
const chartDiv = document.getElementById("chart");
const mapDiv = document.getElementById("map");
const mapLegendDiv = document.getElementById("map-legend");
const pieLegendDiv = document.getElementById("pie-legend");

toggleChartButton.addEventListener("click", () => {
    if (chartDiv.style.display === "block") {
        chartDiv.style.display = "none";
        pieLegendDiv.style.display = "none";
        mapDiv.style.display = "block";
        mapLegendDiv.style.display = "block"; // Show the map legend when map is displayed
        toggleChartButton.innerText = "Switch to Pie Chart";
    } else {
        chartDiv.style.display = "block";
        pieLegendDiv.style.display = "block";
        mapDiv.style.display = "none";
        mapLegendDiv.style.display = "none"; // Hide the map legend when pie chart is displayed
        toggleChartButton.innerText = "Switch to Map";
    }
});

const width = 500, height = 400, margin = 40;
const radius = Math.min(width, height) / 2 - margin;
const color = d3.scaleSequential(d3.interpolateRdYlGn).domain([400, 50]);
const tooltipCombine = d3.select("#tooltip-combine"); // Updated tooltip selection

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

svg.append("text")
    .attr("text-anchor", "middle")
    .attr("y", 10)
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .text("Mortality Rates");

let currentYear = '2021';

function updatePieChart(year) {
    const pie = d3.pie().value(d => d[year]);
    const arc = d3.arc().innerRadius(100).outerRadius(radius);

    d3.csv("dataset/data.csv").then(data => {
        console.log('CSV Data:', data); // Log data to ensure it's loaded
        const data_ready = pie(data);

        svg.selectAll('path')
            .data(data_ready)
            .join(
                enter => enter.append('path')
                    .attr('d', arc)
                    .attr('fill', d => color(d.data[year]))
                    .attr("stroke", "black")
                    .style("stroke-width", "2px")
                    .style("opacity", 0.7)
                    .each(function(d) { this._current = d; })
                    .on('mouseover', (event, d) => {
                        tooltipCombine.html(`Country: ${d.data.Category}<br>People: ${d.data[year]}`)
                            .style("visibility", "visible")
                            .classed("visible", true);
                    })
                    .on('mousemove', event => {
                        tooltipCombine.style("top", (event.pageY + 10) + "px")
                            .style("left", (event.pageX + 10) + "px");
                    })
                    .on('mouseleave', () => {
                        tooltipCombine.classed("visible", false);
                    }),
                update => update.transition().duration(1000)
                    .attrTween("d", function(d) {
                        const interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(1);
                        return t => arc(interpolate(t));
                    })
                    .attr('fill', d => color(d.data[year])),
                exit => exit.remove()
            );
    });
}

updatePieChart(currentYear);

d3.select("#yearToggle").on("click", () => {
    currentYear = currentYear === '2021' ? '2011' : '2021';
    updatePieChart(currentYear);
    updateMapColors(currentYear);
    document.getElementById('yearToggle').innerText = currentYear === '2021' ? 'Switch to 2011 Data' : 'Switch to 2021 Data';
});

// Function to create legends for pie and map views
function createLegends() {
    const pieLegendData = [
        { color: "#ff0000", label: "High (Red)" },
        { color: "#ffff00", label: "Medium (Yellow)" },
        { color: "#00ff00", label: "Low (Green)" }
    ];

    const pieLegend = d3.select("#pie-legend").append("svg")
        .attr("width", 250)
        .attr("height", pieLegendData.length * 30);

    pieLegend.selectAll("g")
        .data(pieLegendData)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 30})`)
        .call(g => {
            g.append("rect")
                .attr("x", 10)
                .attr("y", 10)
                .attr("width", 20)
                .attr("height", 20)
                .attr("fill", d => d.color);

            g.append("text")
                .attr("x", 40)
                .attr("y", 25)
                .text(d => d.label)
                .style("font-size", "14px")
                .attr("alignment-baseline", "middle");
        });

    const mapLegendData = [
        { color: "#ff0000", label: "High (Red)" },
        { color: "#ffff00", label: "Medium (Yellow)" },
        { color: "#00ff00", label: "Low (Green)" },
        { color: "#add8e6", label: "No Data (Light Blue)" }
    ];

    const mapLegend = d3.select("#map-legend").append("svg")
        .attr("width", 250)
        .attr("height", mapLegendData.length * 30);

    mapLegend.selectAll("g")
        .data(mapLegendData)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 30})`)
        .call(g => {
            g.append("rect")
                .attr("x", 10)
                .attr("y", 10)
                .attr("width", 20)
                .attr("height", 20)
                .attr("fill", d => d.color);

            g.append("text")
                .attr("x", 40)
                .attr("y", 25)
                .text(d => d.label)
                .style("font-size", "14px")
                .attr("alignment-baseline", "middle");
        });
}

// Initial legend creation
createLegends();

// Map setup and color scale
const mapSvg = d3.select("#map").append("svg").attr("width", width).attr("height", height);
const projection = d3.geoMercator().center([10, 50]).scale(280).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);
const colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([50, 400]);

function updateMapColors(year) {
    mapSvg.selectAll("path")
        .transition()
        .duration(500)
        .attr("fill", d => d.properties[year] ? colorScale(d.properties[year]) : "#add8e6");
}

// Load external GeoJSON and CSV data
Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),  // Replaced local path with external URL
    d3.csv("dataset/data.csv", d => ({
        country: d.Category,
        value2021: +d['2021'],
        value2011: +d['2011']
    }))
]).then(([geo, csv]) => {
    const dataMap = {};
    csv.forEach(d => { dataMap[d.country] = { value2021: d.value2021, value2011: d.value2011 }; });

    geo.features.forEach(d => {
        const countryData = dataMap[d.properties.name];
        d.properties['2021'] = countryData ? countryData.value2021 : null;
        d.properties['2011'] = countryData ? countryData.value2011 : null;
    });

    mapSvg.selectAll("path")
        .data(geo.features)
        .join("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", d => d.properties[currentYear] ? colorScale(d.properties[currentYear]) : "#add8e6")
        .on("mouseover", (event, d) => {
            tooltipCombine.style("visibility", "visible")
                .classed("visible", true)
                .html(`
                    <strong>${d.properties.name}</strong><br>
                    ${currentYear}: ${d.properties[currentYear] || "No data"}
                `);
        })
        .on("mousemove", event => {
            tooltipCombine.style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
            tooltipCombine.classed("visible", false);
        });
});
