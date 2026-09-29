import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const chart = data => {
  const width = 928;
  const height = width;
  const innerRadius = 180;
  const outerRadius = Math.min(width, height) / 2;

  // Keep months in calendar order.
  const months = monthNames.filter(month =>
    data.some(d => d.month === month)
  );

  // Get all locations that occur anywhere in the data.
  const locations = Array.from(
    new Set(data.map(d => d.location).sort())
  );

  /*
   * Pivot the data so every month has one object containing a value
   * for every location.
   */
  const valuesByMonth = d3.rollup(
    data,
    values => d3.sum(values, d => +d.spentTime / 60 || 0),
    d => d.month,
    d => d.location
  );

  const stackedData = months.map(month => {
    const locationValues = valuesByMonth.get(month) || new Map();

    return {
      month,
      ...Object.fromEntries(
        locations.map(location => [
          location,
          locationValues.get(location) || 0
        ])
      )
    };
  });

  // Stack each location within each month.
  const series = d3
    .stack()
    .keys(locations)(stackedData);

  // Angular scale: one column per month.
  const x = d3
    .scaleBand()
    .domain(months)
    .range([0, 2 * Math.PI])
    .align(0);

  // Radial scale: total spent time determines the height.
  const maxTotal = d3.max(stackedData, d =>
    d3.sum(locations, location => d[location])
  );

  const y = d3
    .scaleRadial()
    .domain([0, maxTotal])
    .range([innerRadius, outerRadius]);

  const arc = d3
    .arc()
    .innerRadius(d => y(d[0]))
    .outerRadius(d => y(d[1]))
    .startAngle(d => x(d.data.month))
    .endAngle(d => x(d.data.month) + x.bandwidth())
    .padAngle(1.5 / innerRadius)
    .padRadius(innerRadius);

  const color = d3
    .scaleOrdinal()
    .domain(locations)
    .range(d3.quantize(d3.interpolateSpectral, locations.length))
    .unknown("#ccc");

  const formatValue = value =>
    Number.isFinite(value)
      ? d3.format(",.2f")(value)
      : "N/A";

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr(
      "style",
      "width: 100%; height: auto; font: 10px sans-serif;"
    );

  /*
   * Stacked radial bars.
   */
  svg
    .append("g")
    .selectAll("g")
    .data(series)
    .join("g")
    .attr("fill", d => color(d.key))
    .selectAll("path")
    .data(layer =>
      layer.map(d => {
        d.location = layer.key;
        return d;
      })
    )
    .join("path")
    .attr("class", "arc")
    .attr("d", arc)
    .append("title")
    .text(d => {
      const month = d.data.month;
      const location = d.location;
      const value = d.data[location];

      return `${month}\n${location}: ${formatValue(value)}`;
    });

  /*
   * Month labels and tick marks.
   */
  svg
    .append("g")
    .attr("text-anchor", "middle")
    .selectAll("g")
    .data(months)
    .join("g")
    .attr(
      "transform",
      month => `
        rotate(${(
          (x(month) + x.bandwidth() / 2) * 180 / Math.PI -
          90
        )})
        translate(${innerRadius},0)
      `
    )
    .call(g =>
      g
        .append("line")
        .attr("x2", -5)
        .attr("stroke", "#000")
    )
    .call(g =>
      g
        .append("text")
        .attr(
          "transform",
          month =>
            (x(month) +
              x.bandwidth() / 2 +
              Math.PI / 2) %
              (2 * Math.PI) <
            Math.PI
              ? "rotate(90)translate(0,16)"
              : "rotate(-90)translate(0,-9)"
        )
        .text(month => month)
    );

  /*
   * Radial axis.
   */
  svg
    .append("g")
    .attr("text-anchor", "middle")
    .call(g =>
      g
        .append("text")
        .attr("y", d => -y(y.ticks(5).pop()))
        .attr("dy", "-1em")
        .text("Spent time in hours")
    )
    .call(g =>
      g
        .selectAll("g")
        .data(y.ticks(5).slice(1))
        .join("g")
        .attr("fill", "none")
        .call(g =>
          g
            .append("circle")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.25)
            .attr("r", y)
        )
        .call(g =>
          g
            .append("text")
            .attr("y", d => -y(d))
            .attr("dy", "0.35em")
            .attr("stroke", "#fff")
            .attr("stroke-width", 5)
            .text(d3.format(",.2f"))
        )
        .call(g =>
          g
            .append("text")
            .attr("y", d => -y(d))
            .attr("dy", "0.35em")
            .attr("fill", "#000")
            .text(d3.format(",.2f"))
        )
    );

  /*
   * Legend.
   */
  svg
    .append("g")
    .selectAll("g")
    .data(locations)
    .join("g")
    .attr(
      "transform",
      (location, i, nodes) =>
        `translate(-40, ${
          (nodes.length / 2 - i - 1) * 20
        })`
    )
    .call(g =>
      g
        .append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", color)
    )
    .call(g =>
      g
        .append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(location => location)
    );

  return svg.node();
};


/*
 * Load and prepare the data.
 */
const loadData = async () => {
  const worklog = await d3.csv("./household_worklog_500.csv");
  const issues = await d3.csv("./Issues.csv");

  const issueMap = new d3.InternMap(
    issues.map(issue => [
      issue["Issue Id"],
      issue
    ])
  );

  const rows = [];

  worklog.forEach(workItem => {
    const issue = issueMap.get(workItem["Issue ID"]);

    // Ignore worklog rows whose issue is not in Issues.csv.
    if (!issue) return;

    const date = new Date(workItem.Date);

    rows.push({
      month: date.toLocaleDateString("de-DE", {
        month: "long"
      }),
      location: issue.location,
      spentTime: +workItem["Spent time"] || 0
    });
  });

  /*
   * Aggregate duplicate month/location combinations.
   */
  const grouped = d3.rollup(
    rows,
    values => d3.sum(values, d => d.spentTime),
    d => d.month,
    d => d.location
  );

  return Array.from(grouped, ([month, locations]) =>
    Array.from(locations, ([location, spentTime]) => ({
      month,
      location,
      spentTime
    }))
  ).flat();
};

const preparedData = await loadData();

document
  .querySelector("#chart")
  .append(chart(preparedData));
