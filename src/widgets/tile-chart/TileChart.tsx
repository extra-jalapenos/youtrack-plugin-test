import {useEffect, useRef, useState} from "react";
import type { TileChartConfig } from "./types"
import {
	select,
	scaleLinear, scaleTime,
	axisBottom, axisLeft
} from "d3";

const TileChart = ({ data, viewBoxWidth, viewBoxHeight }: TileChartConfig) => {

	const svgContainer = useRef<HTMLDivElement>(null);

	const [ratio, setRatio] = useState({ width: 0, height: 0 })
	const svgRef = useRef<SVGSVGElement>(null);
	const canvasRef = useRef<SVGGElement>(null);
	const axesRef = useRef<SVGGElement>(null);

	const margin = {
		left: 25,
		right: 10,
		bottom: 20,
		top: 10,
	}

	let canvasWidth = viewBoxWidth - margin.left - margin.right;
	let canvasHeight = viewBoxHeight - margin.top - margin.bottom;

	console.log(canvasWidth);

	let xScale = scaleTime()
		.domain([new Date(2025, 10, 1), new Date()])
		.range([0, canvasWidth]);

	let yScale = scaleLinear()
		.domain([0, 100])
		.range([canvasHeight, 0]);

	useEffect(() => {
		if (!svgRef.current) return;

		const axes = select(axesRef.current);
		axes.selectChildren().remove()
		axes.append("g")
			.attr("class", "x axis")
			.attr("transform", `translate(0, ${canvasHeight})`)
			.call(axisBottom(xScale).ticks(4));

		axes.append("g")
			.attr("class", "y axis")
			.call(axisLeft(yScale));

	}, [svgRef.current, viewBoxWidth, viewBoxHeight]);
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
				<g
					ref={canvasRef}
					className={`canvas`}
					transform={`translate(${margin.left}, ${margin.top})`}
				>

				</g>
				<g
					ref={axesRef}
					className={`axes`}
					transform={`translate(${margin.left}, ${margin.top})`}
				>

				</g>
			</svg>
		</>
	)
}

export default TileChart
