import {useEffect, useRef, useState} from "react";
import type { TileChartConfig, TileChartDataPoint } from "./types"
import {
	select,
	extent,
	scaleLinear, scaleTime,
	axisBottom, axisLeft,
	utcMonday
} from "d3";
import { getEmptyMap, getMondays } from "./helper";

const TileChart = ({ data, viewBoxWidth, viewBoxHeight }: TileChartConfig) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const [from, setFrom] = useState(new Date(2025, 10, 3));
	const [to, setTo] = useState(new Date());
	console.log(getEmptyMap(from, to))
	const viewBoxDimensions = {
		width: viewBoxWidth,
		height: viewBoxHeight
	}

	const margin = {
		left: 35,
		right: 10,
		bottom: 20,
		top: 10,
	}

	let canvasWidth = viewBoxWidth - margin.left - margin.right;
	let canvasHeight = viewBoxHeight - margin.top - margin.bottom;

	let xScale = scaleTime()
		.domain([from, to])
		.range([0, canvasWidth]);

	let yScale = scaleLinear()
		.domain([0, 100])
		.range([canvasHeight, 0]);

	useEffect(() => {
		if (!svgRef.current) return;
		const svg = select(svgRef.current);
		svg.selectChildren().remove();

		const axes = svg.append("g")
			.attr("class", "axes")
			.attr("transform", `translate(${margin.left}, ${margin.top})`);
			
		axes.append("g")
			.attr("class", "x axis")
			.attr("transform", `translate(0, ${canvasHeight})`)
			.call(axisBottom(xScale).ticks(4));

		axes.append("g")
			.attr("class", "y axis")
			.attr("transform", `translate(${0}, 0)`)
			.call(axisLeft(yScale));

	}, [svgRef.current, viewBoxDimensions]);
/*

	const svgWidth = 200
	const svgHeight = 100
	const init = () => {
		console.log("in init")
		console.log(svgContainer.current)
		const svg = select("svg")
		svg.selectAll("rect.corners")
			.data(Array(6))
			.enter()
			.append("rect")
			.attr("class", "corners")
			.attr("x", (d, i) => (i % 3) * svgWidth / 2 - 2.5 * (i % 3))
			.attr("y", (d, i) => (i % 2) * (svgHeight - 5))
			.attr("width", 5)
			.attr("height", 5)
			.attr("fill", (d, i) => ["red", "yellow", "blue"][i%3])
	}


	const printDimensions = () => {
		return
	}

	window.addEventListener("resize", printDimensions)
*/

	// useEffect(init, [])
	return(
		<>
			<svg
				ref={svgRef}
				viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
			>
			</svg>
		</>
	)
}

export default TileChart
