d3.csv("dataset/Chart1.csv").then(function(data) {
    const margin = { top: 80, right: 100, bottom: 50, left: 80 },
          width = 800 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    // Create SVG canvas inside a container div
    const svgContainer = d3.select("#Chart1"); // Select the container div
    const svg = svgContainer
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

// Add headers
svg.append("text")
    .attr("x", 0)
    .attr("y", -40) // Position above the chart
    .attr("class", "chart-title")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .style("font-family", "'Open Sans', sans-serif") // Set font family to Open Sans
    .style("fill", "#1d3557") // Replace with the exact color from the image if known
    .text("Stroke Mortality, 2021 and 2011");

svg.append("text")
    .attr("x", 0)
    .attr("y", -20) // Position slightly below the title
    .attr("class", "chart-subtitle")
    .style("font-size", "14px")
    .style("font-family", "'Open Sans', sans-serif") // Match font family to Open Sans
    .style("fill", "#1d3557") // Use the same color as the title
    .text("Age standardised rates per 100 000 population");

    // Parse data and ensure numeric values
    data.forEach(d => {
        d["2021"] = +d["2021"];
        d["2011"] = +d["2011"];
    });

    // Define scales
    const y = d3.scaleBand()
        .domain(data.map(d => d.Country))
        .range([0, height])
        .padding(0.6);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d["2021"], d["2011"])) + 20])
        .range([0, width]);

    // Function to run D3 animation when the chart is in view
    function animateChart() {
        // Draw slope lines with animation
        svg.selectAll(".slope-line")
            .data(data)
            .enter()
            .append("line")
            .attr("class", "slope-line")
            .attr("x1", 0)
            .attr("y1", d => y(d.Country) + y.bandwidth() / 2)
            .attr("x2", 0) // Start the lines at x = 0 for animation
            .attr("y2", d => y(d.Country) + y.bandwidth() / 2)
            .attr("stroke", d => d["2021"] > d["2011"] ? "green" : "red")
            .transition() // Animate line width
            .duration(1000)
            .attr("x2", width);

        // Add circles for 2011 values with animation
        svg.selectAll(".dot2011")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot2011")
            .attr("cx", 0) // Start the circles at x = 0 for animation
            .attr("cy", d => y(d.Country) + y.bandwidth() / 2)
            .attr("r", 5)
            .attr("fill", "#1f77b4")
            .transition()
            .duration(2000)
            .attr("cx", d => x(d["2011"]));

        // Add circles for 2021 values with animation
        svg.selectAll(".dot2021")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot2021")
            .attr("cx", 0) // Start the circles at x = 0 for animation
            .attr("cy", d => y(d.Country) + y.bandwidth() / 2)
            .attr("r", 5)
            .attr("fill", "#ff7f0e")
            .transition()
            .duration(2000)
            .attr("cx", d => x(d["2021"]));

        // Add country labels to the left of the lines
        svg.selectAll(".country-label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "country-label")
            .attr("x", -5)
            .attr("y", d => y(d.Country) + y.bandwidth() / 2)
            .attr("text-anchor", "end")
            .attr("dy", "0.35em")
            .style("opacity", 0) // Start with labels hidden
            .text(d => d.Country)
            .transition()
            .duration(500)
            .delay(1000) 
            .style("opacity", 1);

        // Add tooltip1 div
        const tooltip1 = d3.select("body").append("div")
            .attr("class", "tooltip1");

        // Tooltip mouse events for each dot
        svg.selectAll("circle")
            .on("mouseover", function(event, d) {
                tooltip1.style("display", "inline");
                const year = d3.select(this).attr("class") === "dot2011" ? "2011" : "2021";
                const value = year === "2011" ? d["2011"] : d["2021"];
                tooltip1.html(`<strong>${d.Country}</strong> (${year}): ${value}`);
            })
            .on("mousemove", function(event) {
                tooltip1.style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function() {
                tooltip1.style("display", "none");
            });

        // Add legend
        const legendData = [{ year: "2021", color: "#ff7f0e" }, { year: "2011", color: "#1f77b4" }];
        const legend = svg.selectAll(".legend")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${width + 30}, ${i * 20})`);

        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => d.color);

        legend.append("text")
            .attr("x", 15)
            .attr("y", 10)
            .style("text-anchor", "start")
            .text(d => d.year);
    }

    // Set up Intersection Observer
    const chartContainer = document.querySelector("#Chart1");
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Only animate once by unobserving after the first trigger
                    animateChart();
                    observer.unobserve(chartContainer);
                }
            });
        },
        {
            root: null, // Use the viewport as the root
            threshold: 0.9 // Trigger when 90% of the chart is visible
        }
    );

    // Start observing the chart container
    observer.observe(chartContainer);
});
