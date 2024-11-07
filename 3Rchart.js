// Load the CSV data
d3.csv("Dataset2.csv").then(function(data) {
    const margin = { top: 50, right: 100, bottom: 50, left: 80 },
          width = 800 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    // Create SVG canvas
    const svg = d3.select("#slopechart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse data and ensure numeric values
    data.forEach(d => {
        d["2021"] = +d["2021"];
        d["2011"] = +d["2011"];
    });

    // Define scales
    const y = d3.scaleBand()
        .domain(data.map(d => d.Country))
        .range([0, height])
        .padding(0.6); // Increased padding for more space between lines

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d["2021"], d["2011"])) + 20])
        .range([0, width]);

    // Draw slope lines
    svg.selectAll(".slope-line")
        .data(data)
        .enter()
        .append("line")
        .attr("class", "slope-line")
        .attr("x1", 0)
        .attr("y1", d => y(d.Country) + y.bandwidth() / 2)
        .attr("x2", width)
        .attr("y2", d => y(d.Country) + y.bandwidth() / 2)
        .attr("stroke", d => d["2021"] > d["2011"] ? "green" : "red");

    // Add circles for 2011 values
    svg.selectAll(".dot2011")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot2011")
        .attr("cx", d => x(d["2011"]))
        .attr("cy", d => y(d.Country) + y.bandwidth() / 2)
        .attr("r", 5)
        .attr("fill", "#1f77b4");

    // Add circles for 2021 values
    svg.selectAll(".dot2021")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot2021")
        .attr("cx", d => x(d["2021"]))
        .attr("cy", d => y(d.Country) + y.bandwidth() / 2)
        .attr("r", 5)
        .attr("fill", "#ff7f0e");

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
        .text(d => d.Country);


    // Add tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    // Tooltip mouse events for each dot
    svg.selectAll("circle")
        .on("mouseover", function(event, d) {
            tooltip.style("display", "inline");
            const year = d3.select(this).attr("class") === "dot2011" ? "2011" : "2021";
            const value = year === "2011" ? d["2011"] : d["2021"];
            tooltip.html(`${d.Country} (${year}): ${value}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });

    // Add legend
    const legendData = [{ year: "2021", color: "#ff7f0e" }, { year: "2011", color: "#1f77b4" }];
    const legend = svg.selectAll(".legend")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 30}, ${i * 20})`); // Moved legend to the side

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
});
