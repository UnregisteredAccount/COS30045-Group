// Set the dimensions and margins for the chart
var width = 450, height = 450, margin = 40;
var radius = Math.min(width, height) / 2 - margin;

// Create the tooltip
var tooltip = d3.select("#tooltip");

// Append the svg object for the chart
var svg = d3.select("#chart")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Set the color scale
var color = d3.scaleOrdinal()
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

// Variable to track current year
var currentYear = '2021';

// Load the data
d3.csv("data.csv").then(function(data) {

  // Pie generator function
  var pie = d3.pie()
    .value(function(d) { return d[currentYear]; });

  // Define arc generator
  var arc = d3.arc()
    .innerRadius(100)
    .outerRadius(radius);

  // Function to update the pie chart
  function updateChart(year) {
    currentYear = year;

    // Update the data for the pie chart
    var data_ready = pie(data);

    // Update paths in the pie chart
    svg.selectAll('path')
      .data(data_ready)
      .join('path')
      .attr('d', arc)
      .attr('fill', function(d){ return color(d.data.Category); })
      .attr("stroke", "black")
      .style("stroke-width", "2px")
      .style("opacity", 0.7)
      .on('mouseover', function(event, d) {
        tooltip
          .html("Country: " + d.data.Category + "<br>People: " + d.data[currentYear])
          .style("opacity", 1);
      })
      .on('mousemove', function(event) {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY + 10) + "px");
      })
      .on('mouseleave', function() {
        tooltip.style("opacity", 0);
      });

    // Update button text
    document.getElementById('yearToggle').innerText = currentYear === '2021' ? 'Switch to 2011 Data' : 'Switch to 2021 Data';
  }

  // Initial chart setup for 2021 data
  updateChart('2021');

  // Event listener for the toggle button
  d3.select("#yearToggle").on("click", function() {
    // Toggle between 2021 and 2011
    var newYear = currentYear === '2021' ? '2011' : '2021';
    updateChart(newYear);
  });
});
