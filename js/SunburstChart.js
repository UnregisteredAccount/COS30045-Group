document.addEventListener("DOMContentLoaded", function() {
    // Set dimensions
    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 2;

    // Custom color mapping with brighter colors for certain categories
    const categoryColors = {
        "Diseases of circulatory system": "#1f77b4",
        "Cancers": "#ff7f0e",
        "External causes": "#2ca02c",
        "Diseases of respiratory system": "#ff9800",
        "Alzheimer's and dementias": "#8bc34a",
        "Diabetes": "#e91e63",
        "COVID-19": "#00bcd4"
    };

    const color = d3.scaleOrdinal()
        .domain(Object.keys(categoryColors))
        .range(Object.values(categoryColors));

    // Create SVG
    const svg = d3.select("#sunburst-chart-inner-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Center text for "Causes of Death"
    svg.append("text")
        .attr("class", "center-text")
        .attr("x", 0)
        .attr("y", -10)
        .text("Causes of Death")
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold");

    // Add "Total: 12818369" text below the "Causes of Death" label
    svg.append("text")
        .attr("class", "total-text")
        .attr("x", 0)
        .attr("y", 15)
        .text("Total: 12818369")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#333");

    // Load CSV data
    d3.csv("dataset/data2.csv").then(data => {
        // Convert data into hierarchical structure
        const rootData = {
            name: "Causes of Death",
            children: d3.groups(data, d => d.category).map(([category, values]) => ({
                name: category,
                children: values.map(d => ({
                    name: d.subcategory || category,
                    value: +d.number
                }))
            }))
        };

        // Create the partition layout
        const partition = d3.partition()
            .size([2 * Math.PI, radius]);

        // Convert data to hierarchy and sum values
        const root = d3.hierarchy(rootData)
            .sum(d => d.value);

        // Apply partition to the root hierarchy
        partition(root);

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1);

        const totalSum = root.value;

        // Draw the arcs with expand/contract animation on hover
        svg.selectAll("path")
            .data(root.descendants().filter(d => d.depth > 0))
            .enter()
            .append("path")
            .attr("display", d => d.depth ? null : "none")
            .attr("d", arc)
            .style("stroke", "#fff")
            .style("fill", d => color((d.children ? d : d.parent).data.name))
            .on("mouseover", function(event, d) {
                d3.select(this).transition()
                    .duration(200)
                    .attr("d", d3.arc()  // Expand outward by 10px on hover
                        .startAngle(d.x0)
                        .endAngle(d.x1)
                        .innerRadius(d.y0)
                        .outerRadius(d.y1 + 10));
                
                // Show tooltip
                const tooltip = d3.select("#tooltip-graph3");
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                tooltip.html(`Category: ${d.data.name}<br>Deaths: ${d.value.toLocaleString()} (${((d.value / totalSum) * 100).toFixed(2)}%)`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mousemove", event => {
                d3.select("#tooltip-graph3")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).transition()
                    .duration(200)
                    .attr("d", arc);  // Reset to original size
                
                // Hide tooltip
                d3.select("#tooltip-graph3").transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        // Helper function to split long labels
        function splitText(text, maxChars) {
            const words = text.split(" ");
            const lines = [];
            let currentLine = words.shift();

            while (words.length > 0) {
                const word = words.shift();
                if ((currentLine + " " + word).length <= maxChars) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);
            return lines;
        }

        // Add wrapped text labels with percentages
        svg.selectAll("text.arc-label")
            .data(root.descendants().filter(d => d.depth > 0))
            .enter()
            .append("text")
            .attr("class", "arc-label")
            .attr("transform", d => {
                const angle = (d.x0 + d.x1) / 2 * (180 / Math.PI);
                const rotate = angle < 180 ? angle - 90 : angle + 90;
                const translate = `translate(${arc.centroid(d)}) rotate(${rotate})`;
                return translate;
            })
            .attr("dy", "0.35em")
            .each(function(d) {
                const lines = splitText(d.data.name, 15);
                lines.forEach((line, i) => {
                    d3.select(this)
                        .append("tspan")
                        .attr("x", 0)
                        .attr("y", i * 12)
                        .text(line);
                });
                const percentage = ((d.value / totalSum) * 100).toFixed(2);
                d3.select(this)
                    .append("tspan")
                    .attr("x", 0)
                    .attr("y", lines.length * 12)
                    .text(`(${percentage}%)`);
            })
            .style("font-size", "10px")
            .style("text-anchor", "middle")
            .style("fill", "#000");
    }).catch(error => {
        console.error("Error loading the CSV file: ", error);
    });

    // Set up Intersection Observer for roll-in animation
    const sunburstContainer = document.querySelector("#sunburst-chart-inner-container");
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                sunburstContainer.classList.add("roll-in");  // Add roll-in animation
                observer.unobserve(sunburstContainer);  // Stop observing after first trigger
            }
        });
    }, { threshold: 0.5 });

    // Start observing the sunburst container
    observer.observe(sunburstContainer);
});
