// Set dimensions and margins
const width = 1000, height = 600, margin = { top: 30, right: 30, bottom: 70, left: 60 };

// Append SVG object
const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Define factors and levels to analyze with updated labels for gluc and alco
const factors = {
  gender: ["male_disease", "male_noDisease", "female_disease", "female_noDisease"],
  cholesterol: ["level1_disease", "level1_noDisease", "level2_disease", "level2_noDisease", "level3_disease", "level3_noDisease"],
  glucose: ["level1_disease", "level1_noDisease", "level2_disease", "level2_noDisease", "level3_disease", "level3_noDisease"], // Changed gluc to glucose
  smoke: ["smoker_disease", "smoker_noDisease", "nonSmoker_disease", "nonSmoker_noDisease"],
  alcohol: ["drinker_disease", "drinker_noDisease", "nonDrinker_disease", "nonDrinker_noDisease"] // Changed alco to alcohol
};

// Define descriptive mapping for each factor and level
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

// Load data from CSV
d3.csv("Rchartdata.csv", d3.autoType).then(data => {

  // Transform data for grouped bar chart
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

  // X scale for factors
  const x0 = d3.scaleBand()
    .domain(Object.keys(factors))
    .range([0, width])
    .padding(0.1);

  // X1 scale for levels within each factor
  const x1 = d3.scaleBand()
    .domain(d3.merge(Object.values(factors)))
    .range([0, x0.bandwidth()])
    .padding(0.05);

  // Y scale for counts
  const y = d3.scaleLinear()
    .domain([0, d3.max(aggregatedData, d => d.count)])
    .nice()
    .range([height, 0]);

  // Color scale for cardio status
  const color = d3.scaleOrdinal()
    .domain(["disease", "noDisease"])
    .range(["#ff6347", "#328da8"]); // Use #ff6347 for disease (red) and #328da8 for no disease (blue)

  // Append X axis with updated labels for factors
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0).tickFormat(d => d.charAt(0).toUpperCase() + d.slice(1))); // Capitalize factor names

  // Append Y axis
  svg.append("g")
    .call(d3.axisLeft(y));

  // Draw bars with hover tooltip and adjusted positioning for specified factors
  svg.selectAll("g.factor-group")
    .data(aggregatedData)
    .join("g")
    .attr("transform", d => {
      // Adjust position for specified factors
      let adjustment = 0;
      if (d.factor === "gender") adjustment = 70; 
      if (d.factor === "cholesterol") adjustment = 20; 
      if (d.factor === "glucose") adjustment = 20;       // Shift 'gender' slightly to the right
      if (d.factor === "smoke") adjustment = -30;       // Shift 'smoke' slightly to the left
      if (d.factor === "alcohol") adjustment = -70;     // Shift 'alcohol' further to the left
      return `translate(${x0(d.factor) + adjustment},0)`;
    })
    .each(function(d) {
      const g = d3.select(this).append("g")
        .attr("transform", `translate(${x1(d.level)},0)`)
        .on("mouseover", function(event, d) {
          const description = levelDescriptions[d.factor][d.level] || d.level;
          d3.select("#tooltip")
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px")
            .style("opacity", 0.9)
            .html(`Factor: ${d.factor}<br>Description: ${description}<br>Count: ${d.count}`);
        })
        .on("mouseout", () => d3.select("#tooltip").style("opacity", 0));

      g.append("rect")
        .attr("y", y(d.count))
        .attr("height", y(0) - y(d.count))
        .attr("width", x1.bandwidth())
        .attr("fill", d.level.includes("disease") ? color("disease") : color("noDisease"));
    });

  // Legend for cardio status
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 100},0)`);

  legend.selectAll("rect")
    .data(["disease", "noDisease"]) // Use the same keys as in the color scale
    .join("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * 20)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", d => color(d)); // Apply color scale directly based on the data key

  legend.selectAll("text")
    .data(["Disease", "No Disease"])
    .join("text")
    .attr("x", 20)
    .attr("y", (d, i) => i * 20 + 10)
    .text(d => d);

}).catch(error => console.error("Error loading the CSV data:", error));

// Tooltip div for hover text
d3.select("body").append("div")
  .attr("id", "tooltip")
  .attr("class", "tooltip")
  .style("opacity", 0);
