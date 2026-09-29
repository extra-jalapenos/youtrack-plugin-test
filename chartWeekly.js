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

    if (!issue) return;

    const isoWeek = isoWeekInfo(workItem.Date);

    rows.push({
      year: isoWeek.year,
      week: isoWeek.week,
      weekLabel: isoWeek.label,
      location: issue.location,
      spentTime: +workItem["Spent time"] || 0
    });
  });

  // Aggregate duplicate ISO-week/location combinations.
  const grouped = d3.rollup(
    rows,
    values => d3.sum(values, d => d.spentTime),
    d => d.year,
    d => d.week,
    d => d.weekLabel,
    d => d.location
  );

  return Array.from(grouped, ([year, weeks]) =>
    Array.from(weeks, ([week, labels]) =>
      Array.from(labels, ([weekLabel, locations]) =>
        Array.from(locations, ([location, spentTime]) => ({
          year,
          week,
          weekLabel,
          location,
          spentTime
        }))
      ).flat()
    ).flat()
  ).flat();
};

const chart = data => {
  const width = 928;
  const height = width;
  const innerRadius = 180;
  const outerRadius = Math.min(width, height) / 2;

  // Sort chronologically by ISO year and ISO week.
  const weeks = Array.from(
    new Set(data.map(d => d.weekLabel))
  ).sort((a, b) => {
    const [yearA, weekA] = a.split("-W").map(Number);
    const [yearB, weekB] = b.split("-W").map(Number);

    return yearA - yearB || weekA - weekB;
  });

  const locations = Array.from(
    new Set(data.map(d => d.location).filter(Boolean))
  );

  const valuesByWeek = d3.rollup(
    data,
    values => d3.sum(values, d => +d.spentTime || 0),
    d => d.weekLabel,
    d => d.location
  );

  const stackedData = weeks.map(weekLabel => {
    const locationValues =
      valuesByWeek.get(weekLabel) || new Map();

    return {
      weekLabel,
      ...Object.fromEntries(
        locations.map(location => [
          location,
          locationValues.get(location) || 0
        ])
      )
    };
  });

  const series = d3
    .stack()
    .keys(locations)(stackedData);

  const x = d3
    .scaleBand()
    .domain(weeks)
    .range([0, 2 * Math.PI])
    .align(0);

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
    .startAngle(d => x(d.data.weekLabel))
    .endAngle(d =>
      x(d.data.weekLabel) + x.bandwidth()
    )
    .padAngle(1.5 / innerRadius)
    .padRadius(innerRadius);

  const color = d3
    .scaleOrdinal()
    .domain(locations)
    .range(
      d3.quantize(
        d3.interpolateSpectral,
        Math.max(locations.length, 2)
      )
    );

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr(
      "style",
      "width: 100%; height: auto; font: 10px sans-serif;"
    );
const year = 2026;

const seasons = [
  {
    name: "Winter",
    start: new Date(`${year-1}-12-21T00:00:00Z`),
    end: new Date(`${year}-03-20T00:00:00Z`),
    color: "#74b9ff"
  },
  {
    name: "Spring",
    start: new Date(`${year}-03-20T00:00:00Z`),
    end: new Date(`${year}-06-21T00:00:00Z`),
    color: "#55efc4"
  },
  {
    name: "Summer",
    start: new Date(`${year}-06-21T00:00:00Z`),
    end: new Date(`${year}-09-23T00:00:00Z`),
    color: "#ffeaa7"
  },
  {
    name: "Autumn",
    start: new Date(`${year}-09-23T00:00:00Z`),
    end: new Date(`${year}-12-21T00:00:00Z`),
    color: "#e17055"
  },
];

const startOfYear = new Date(`${year}-01-01T00:00:00Z`);
const endOfYear = new Date(`${year + 1}-01-01T00:00:00Z`);
const daysInYear = (endOfYear - startOfYear) / 86400000;

const dateAngle = date =>
  ((date - startOfYear) / 86400000 / daysInYear) *
  2 *
  Math.PI;

const seasonArc = d3
  .arc()
  .innerRadius(innerRadius - 5)
  .outerRadius(innerRadius - 20)
  .startAngle(d => dateAngle(d.start))
  .endAngle(d => dateAngle(d.end));

	svg
		.append("g")
		.attr("class", "season-sections")
		.selectAll("path")
		.data(seasons)
		.join("path")
		.attr("d", seasonArc)
		.attr("fill", d => d.color)
		.attr("fill-opacity", 0.5)
		.attr("stroke",  "transparent")
		.attr("stroke-width", 0)
		.append("title")
		.text(d => d.name);


  // Stacked radial bars.
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
    .attr("d", arc)
    .append("title")
    .text(d => {
      const value = d.data[d.location];
			const formatToHHmm = (valueInMinutes) => {
				if (value < 60) {
					return String(valueInMinutes).padStart(2) + " m"
				}
				const hours = Math.floor(valueInMinutes / 60)
				valueInMinutes -= hours*60
				return String(hours) + "h " + String(valueInMinutes).padStart(2) + "m"
			}
      return `${d.location}: ${formatToHHmm(value)}`;
    });

  // ISO week labels.
  svg
    .append("g")
    .attr("text-anchor", "middle")
    .selectAll("g")
    .data(weeks)
    .join("g")
    .attr(
      "transform",
      week => `
        rotate(${(
          (x(week) + x.bandwidth() / 2) * 180 / Math.PI -
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
          week =>
            (x(week) +
              x.bandwidth() / 2 +
              Math.PI / 2) %
              (2 * Math.PI) <
            Math.PI
              ? "rotate(90)translate(0,16)"
              : "rotate(-90)translate(0,-9)"
        )
        .text(week => week)
    );

  // Radial axis.
  svg
    .append("g")
    .attr("text-anchor", "middle")
    .call(g =>
      g
        .append("text")
        .attr("y", -y(y.ticks(5).pop()))
        .attr("dy", "-1em")
        .text("Spent time")
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
            .attr("r", y)
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

  // Location legend.
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

const preparedData = await loadData();

document
  .querySelector("#chart")
  .append(chart(preparedData));
