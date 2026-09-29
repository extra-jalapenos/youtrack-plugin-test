// RadialWorklogChart.jsx
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { useEffect, useRef } from "react";
import { monthNames } from "./helper";

function getISOWeek(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );

  // ISO week starts on Monday.
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  return Math.ceil(
    (((d - yearStart) / 86400000) + 1) / 7
  );
}

function getISOWeeksInYear(year) {
  // December 28 is always in the final ISO week of its year.
  return getISOWeek(new Date(year, 11, 28));
}

export default function Chart({ width, height }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const svg = d3
      .select("#root")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr(
        "style",
        "width: 100%; height: auto; font: 10px sans-serif;"
      );

    // Add D3 elements here, for example:
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .text("Chart");

    return () => {
      // Remove the SVG when React unmounts or dependencies change
      svg.remove();
    };
  }, [width, height]);

  return;

  // // old code
  // const height = width;
  // const innerRadius = 180;
  // const outerRadius = Math.min(width, height) / 2;
  // const monthNameArray = monthNames()

  // // Stack the data into series by age
  // // const series = d3.stack()
  // //     .keys(d3.union(data.map(d => d.age))) // distinct series keys, in input order
  // //     .value(([, D], key) => D.get(key).population) // get value for each series key and stack
  // //   (d3.index(data, d => d.state, d => d.age)); // group by stack then series key

  // const arc = d3.arc()
  //     .innerRadius(d => y(d[0]))
  //     .outerRadius(d => y(d[1]))
  //     .startAngle(d => x(0))
  //     .endAngle(d => x(0) + x.bandwidth())
  //     .padAngle(1.5 / innerRadius)
  //     .padRadius(innerRadius);

  // // An angular x-scale
  // const x = d3.scaleBand()
  //     .domain([0, 100])
  //     .range([0, 2 * Math.PI])
  //     .align(0);

  // // A radial y-scale maintains area proportionality of radial bars
  // const y = d3.scaleRadial()
  //     .domain([0, 100])
  //     .range([innerRadius, outerRadius]);

  // // const color = d3.scaleOrdinal()
  // // .domain(categoryArray)
  // // .range(
  // //   d3.quantize(
  // //     d3.interpolateRdYlGn,
  // //     categoryArray.length
  // //   )
  // // )
  // // .unknown("#ccc");

  // // A function to format the value in the tooltip
  // const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  // const svg = d3.create("svg")
  //     .attr("width", width)
  //     .attr("height", height)
  //     .attr("viewBox", [-width / 2, -height / 2, width, height])
  //     .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");

  // // x axis
  // svg.append("g")
  //     .attr("text-anchor", "middle")
  //   .selectAll()
  //   .data(x.domain())
  //   .join("g")
  //     .attr("transform", d => `
  //       rotate(${((x(d) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
  //       translate(${innerRadius},0)
  //     `)
  //     .call(g => g.append("line")
  //         .attr("x2", -5)
  //         .attr("stroke", "#000"))
  //     .call(g => g.append("text")
  //         .attr("transform", d => (x(d) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
  //             ? "rotate(90)translate(0,16)"
  //             : "rotate(-90)translate(0,-9)")
  //         .text(d => d));

  // return svg.node()
}
