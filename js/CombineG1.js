document.addEventListener("DOMContentLoaded", () => {
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

    // Intersection Observer for the chart container with roll-in animation
    const chartContainer = document.querySelector("#chart");
    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                console.log("Is intersecting:", entry.isIntersecting); // Debug log
                if (entry.isIntersecting) {
                    chartContainer.classList.add("roll-in");  // Add roll-in animation class
                    updatePieChart(currentYear);  // Trigger chart update
                    observer.unobserve(chartContainer);  // Stop observing after first trigger
                }
            });
        },
        {
            root: null,     // Use the viewport as the root
            threshold: 0.5, // Adjusted threshold to 50% visibility for easier triggering
        }
    );

    // Start observing the chart container
    observer.observe(chartContainer);

    // Immediately update if in view initially
    if (chartContainer.getBoundingClientRect().top < window.innerHeight) {
        chartContainer.classList.add("roll-in");
        updatePieChart(currentYear);
    }

    // Set up map parameters
    const width = 600, height = 500, margin = 40;
    const color = d3.scaleSequential(d3.interpolateRdYlGn).domain([400, 50]);
    const tooltipCombine = d3.select("#tooltip-combine");

    let currentYear = '2021';
    let zoomScale = 180;  // Default zoom scale for the Earth

    // Create an SVG container for the chart
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

    // Function to update pie chart
    function updatePieChart(year) {
        console.log("Updating Pie Chart for year:", year);  // Debug log
        const pie = d3.pie().value(d => d[year]);
        const arc = d3.arc().innerRadius(100).outerRadius(150);

        d3.csv("dataset/data.csv").then(data => {
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

    // Toggle the year for the pie chart
    d3.select("#yearToggle").on("click", () => {
        currentYear = currentYear === '2021' ? '2011' : '2021';
        updatePieChart(currentYear);
        updateMap();
        document.getElementById('yearToggle').innerText = currentYear === '2021' ? 'Switch to 2011 Data' : 'Switch to 2021 Data';
    });


    // Create legends for pie and map views
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
            { color: "#ADD8E6", label: "No Data (Light Blue)" }
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

    // Set the background color of the SVG to transparent
    mapSvg.style("background-color", "transparent");

    // Set up geoOrthographic projection for full Earth view
    const projection = d3.geoOrthographic()
        .scale(zoomScale)  // Link the zoomScale to control zoom level
        .translate([width / 2, height / 2])  // Center the Earth
        .rotate([0, 0]); // Rotate to ensure the entire Earth is visible

    const path = d3.geoPath().projection(projection);
    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([50, 400]);

    // Add ocean path element that will move and zoom with the countries
    const oceanPath = mapSvg.append("path")
        .datum({type: "Sphere"})
        .attr("d", path)
        .style("fill", "#1E90FF"); // Dark blue ocean color (DodgerBlue)

    // Add zoom functionality to the slider
    d3.select("#zoom-slider").on("input", function() {
        zoomScale = +this.value;  // Get the current value of the slider
        projection.scale(zoomScale);  // Update the scale of the map
        updateMap();  // Redraw the map with the updated scale
    });

    // Function to update the map
    function updateMap() {
        Promise.all([
            d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
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

            // Update the ocean background to move and zoom along with the map
            oceanPath.attr("d", path);

            const paths = mapSvg.selectAll("path.country")
                .data(geo.features)
                .join("path")
                .attr("class", "country")
                .attr("d", path)
                .attr("fill", d => d.properties[currentYear] ? colorScale(d.properties[currentYear]) : "#ADD8E6") // Set no data color to #ADD8E6
                .attr("stroke", "#333") // Optional: adds borders to countries
                .attr("stroke-width", 0.5)
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

            // Drag behavior for rotating the globe
            const drag = d3.drag()
                .on("drag", (event) => {
                    const rotate = projection.rotate();
                    const k = 0.5; // sensitivity of the rotation
                    projection.rotate([
                        rotate[0] + event.dx * k,
                        rotate[1] - event.dy * k
                    ]);
                    paths.attr("d", path); // Update map paths with new rotation
                    oceanPath.attr("d", path); // Update ocean background to rotate along with the globe
                });

            mapSvg.call(drag); // Apply the drag behavior to the SVG container
        });
    }

    // Initial map update
    updateMap();
});
