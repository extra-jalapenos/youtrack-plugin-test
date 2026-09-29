import { useEffect, useRef } from "react";
import "./BarChart.css";

function BarChart({ data, width = 640, height = 360 }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const margin = {
      top: 24,
      right: 24,
      bottom: 48,
      left: 52,
    };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);

    // Clear the previous render before drawing again.
    svg.selectAll("*").remove();

    const chart = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Monthly sales bar chart")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((item) => item.month))
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (item) => item.value)])
      .nice()
      .range([innerHeight, 0]);

    // Horizontal gridlines
    chart
      .append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-innerWidth)
          .tickFormat("")
      );

    // X axis
    chart
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x));

    // Y axis
    chart
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

    // Bars
    chart
      .selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (item) => x(item.month))
      .attr("y", (item) => y(item.value))
      .attr("width", x.bandwidth())
      .attr("height", (item) => innerHeight - y(item.value))
      .attr("rx", 4);

    // Y-axis label
    chart
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -38)
      .attr("text-anchor", "middle")
      .text("Sales");
  }, [data, width, height]);

  return (
    <div className="bar-chart">
      <svg ref={svgRef} />
    </div>
  );
}

export default BarChart;
