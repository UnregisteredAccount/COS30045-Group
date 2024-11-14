// Intersection Observer to trigger chart creation
const chartContainer = document.querySelector("#Chart2");
const observerOptions = {
  root: null, // Observe within the viewport
  threshold: 0.9 // Trigger when 90% of the element is visible
};

// Observer callback to load chart on visibility
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadChart(); // Call the function to load the chart
      observer.unobserve(chartContainer); // Stop observing once chart is loaded
    }
  });
}, observerOptions);

// Observe the #chart container
observer.observe(chartContainer);

// Function to load the chart
function loadChart() {
  // Set dimensions and margins
  const width = 900, height = 500, margin = { top: 70, right: 25, bottom: 60, left: 50 };

  // Append SVG object
  const svg = d3.select("#Chart2")
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
    .text("Cardiovascular Health Indicators and Disease Prediction");

svg.append("text")
    .attr("x", 0)
    .attr("y", -20) // Position slightly below the title
    .attr("class", "chart-subtitle")
    .style("font-size", "14px")
    .style("font-family", "'Open Sans', sans-serif") // Match font family to Open Sans
    .style("fill", "#1d3557") // Use the same color as the title
    .text("Dataset of 70 000 records of patient data");


  // Define factors and levels to analyze
  const factors = {
    gender: ["male_disease", "male_noDisease", "female_disease", "female_noDisease"],
    cholesterol: ["level1_disease", "level1_noDisease", "level2_disease", "level2_noDisease", "level3_disease", "level3_noDisease"],
    glucose: ["level1_disease", "level1_noDisease", "level2_disease", "level2_noDisease", "level3_disease", "level3_noDisease"],
    smoke: ["smoker_disease", "smoker_noDisease", "nonSmoker_disease", "nonSmoker_noDisease"],
    alcohol: ["drinker_disease", "drinker_noDisease", "nonDrinker_disease", "nonDrinker_noDisease"]
  };

  const levelDescriptions = {
    gender: {
      male_disease: "Male with CVD Disease",
      male_noDisease: "Male with No CVD Disease",
      female_disease: "Female with CVD Disease",
      female_noDisease: "Female with No CVD Disease"
    },
    cholesterol: {
      level1_disease: "Normal Cholesterol Level with CVD Disease",
      level1_noDisease: "Normal Cholesterol Level with No CVD Disease",
      level2_disease: "Above Normal Cholesterol Level with CVD Disease",
      level2_noDisease: "Above Normal Cholesterol Level with No CVD Disease",
      level3_disease: "High Cholesterol Level with CVD Disease",
      level3_noDisease: "High Cholesterol Level with No CVD Disease"
    },
    glucose: {
      level1_disease: "Normal Glucose Level with CVD Disease",
      level1_noDisease: "Normal Glucose Level with No CVD Disease",
      level2_disease: "Above Normal Glucose Level with CVD Disease",
      level2_noDisease: "Above Normal Glucose Level with No CVD Disease",
      level3_disease: "High Glucose Level with CVD Disease",
      level3_noDisease: "High Glucose Level with No CVD Disease"
    },
    smoke: {
      smoker_disease: "Smoker with CVD Disease",
      smoker_noDisease: "Smoker with No CVD Disease",
      nonSmoker_disease: "Non-Smoker with CVD Disease",
      nonSmoker_noDisease: "Non-Smoker with No CVD Disease"
    },
    alcohol: {
      drinker_disease: "Drinker with CVD Disease",
      drinker_noDisease: "Drinker with No CVD Disease",
      nonDrinker_disease: "Non-Drinker with CVD Disease",
      nonDrinker_noDisease: "Non-Drinker with No CVD Disease"
    }
  };

  d3.csv("dataset/Chart2.csv", d3.autoType).then(data => {
    let aggregatedData = [];
    Object.entries(factors).forEach(([factor, levels]) => {
      levels.forEach(level => {
        let diseaseStatus = level.includes("disease") ? 1 : 0;
        let subLevel = level.split("_")[0];
        let count = data.filter(d => {
          switch (factor) {
            case "gender": return (d.gender == 2 && subLevel === "male" || d.gender == 1 && subLevel === "female") && d.cardio == diseaseStatus;
            case "cholesterol": return d.cholesterol == parseInt(subLevel.replace("level", "")) && d.cardio == diseaseStatus;
            case "glucose": return d.gluc == parseInt(subLevel.replace("level", "")) && d.cardio == diseaseStatus;
            case "smoke": return d.smoke == (subLevel === "smoker" ? 1 : 0) && d.cardio == diseaseStatus;
            case "alcohol": return d.alco == (subLevel === "drinker" ? 1 : 0) && d.cardio == diseaseStatus;
          }
        }).length;
        aggregatedData.push({ factor, level, count });
      });
    });

    const x0 = d3.scaleBand().domain(Object.keys(factors)).range([0, width]).padding(0.1);
    const x1 = d3.scaleBand().domain(d3.merge(Object.values(factors))).range([0, x0.bandwidth()]).padding(0.05);
    const y = d3.scaleLinear().domain([0, d3.max(aggregatedData, d => d.count)]).nice().range([height, 0]);
    const color = d3.scaleOrdinal().domain(["disease", "noDisease"]).range(["#ff6347", "#328da8"]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x0).tickFormat(d => d.charAt(0).toUpperCase() + d.slice(1)));
    svg.append("g").call(d3.axisLeft(y));

    svg.selectAll("g.factor-group")
      .data(aggregatedData)
      .join("g")
      .attr("transform", d => {
        let adjustment = 0;
        if (d.factor === "gender") adjustment = 62;
        if (d.factor === "cholesterol") adjustment = 17;
        if (d.factor === "glucose") adjustment = 18;
        if (d.factor === "smoke") adjustment = -27;
        if (d.factor === "alcohol") adjustment = -62;
        return `translate(${x0(d.factor) + adjustment},0)`;
      })
      .each(function(d) {
        const g = d3.select(this).append("g")
          .attr("transform", `translate(${x1(d.level)},0)`)
          .on("mouseover", function(event, d) {
            const description = levelDescriptions[d.factor][d.level] || d.level;
            d3.select("#tooltip2")
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px")
              .style("opacity", 1)
              .html(`<strong>${description}</strong><br>Count: ${d.count}`);
          })
          .on("mouseout", () => d3.select("#tooltip2").style("opacity", 0));

        g.append("rect")
          .attr("y", height)
          .attr("height", 0)
          .attr("width", x1.bandwidth())
          .attr("fill", d.level.includes("disease") ? color("disease") : color("noDisease"))
          .transition()
          .duration(1800)
          .attr("y", y(d.count))
          .attr("height", y(0) - y(d.count));
      });

    const legendData = [{ year: "2021", color: "#ff7f0e" }, { year: "2011", color: "#1f77b4" }];
    const legend = svg.selectAll(".legend")
      .data(legendData)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${width - 100}, ${i * 12})`);

    legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", d => d.color)
      .style("stroke", "black")
      .style("stroke-width", "1px");

    legend.append("text")
      .attr("x", 15)
      .attr("y", 10)
      .style("text-anchor", "start")
      .style("font-size", "10px")
      .text(d => d.year);
  }).catch(error => console.error("Error loading the CSV data:", error));

  d3.select("body").append("div")
    .attr("id", "tooltip2")
    .attr("class", "tooltip2")
    .style("opacity", 0);
}
