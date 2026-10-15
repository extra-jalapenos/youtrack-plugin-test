import {useEffect, useRef, useState} from "react";
import type { TileChartConfig, TileChartDataPoint } from "./types"
import {
	select,
	extent,
	scaleLinear, scaleTime,
	axisBottom, axisLeft,
	utcMonday,
	timeFormat,
	timeMonday,
	scaleBand,
	timeDays,
	timeInterval,
	timeDay,
	scaleDiverging,
	interpolateCubehelix,
	scaleSequential,
	interpolateHsl,
	type Color,
	color,
	interpolateHcl,
	interpolateBasis
} from "d3";
import { getEmptyMap } from "./helper";

const TileChart = ({ data, viewBoxWidth, viewBoxHeight }: TileChartConfig) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const [from, setFrom] = useState(new Date(2025, 10, 3));
	const [to, setTo] = useState(new Date());

	const emptyMap = getEmptyMap(from, to)

	const margin = {
		left: 40,
		right: 10,
		bottom: 20,
		top: 10,
	}

	let canvasWidth = viewBoxWidth - margin.left - margin.right;
	let canvasHeight = viewBoxHeight - margin.top - margin.bottom;
	const colorScale = scaleSequential([0, 1], interpolateHcl("#0098F7", "#f7004a"))

	const changeOpacity = (colorString: string, opacity: number): string => color(colorString).copy({ opacity }).formatHex8()

	const lastMonday = timeMonday(new Date())
	const formatAsLocalWeekday = (d: Date) => d.toLocaleDateString([], { weekday: "short" })
	const weekdays = timeDays(lastMonday, timeDay.offset(lastMonday, 7)).map(d => formatAsLocalWeekday(d))
	let yScale = scaleBand()
		.domain(weekdays)
		.range([0, canvasHeight])
		.padding(0.2);

	// now we know how high one rect is and therefore how wide
	const getWeekOffset = (date: Date) => timeMonday.count(timeMonday(date), to)
	

	useEffect(() => {
		if (!svgRef.current) return;
		const svg = select(svgRef.current);
		svg.selectChildren().remove();

		const axes = svg.append("g")
			.attr("class", "axes")
			.attr("transform", `translate(${margin.left}, ${margin.top})`);
			
		// axes.append("g")
		// 	.attr("class", "x axis")
		// 	.attr("transform", `translate(0, ${canvasHeight})`)
		// 	.call(axisBottom(xScale).ticks(4));

		axes.append("g")
			.attr("class", "y axis")
			.attr("transform", `translate(${0}, 0)`)
			.call(axisLeft(yScale));

		const canvas = svg.append("svg")
			.attr("class", "canvas")
			.attr("transform", `translate(${margin.left}, ${margin.top})`);

		const weekColumns = canvas.selectAll("rect")
			.data(emptyMap)
			.join(
				enter => enter
					.append("rect")
					.attr("fill", "transparent")
					.transition()
					.duration(d => 250 + Math.random() * 750 )
					.attr("fill", _ => changeOpacity(colorScale(Math.random()), Math.random())),
				update => update,
				exit => exit.remove()
			)
			.attr("rx", yScale.step() * 0.2)
			.attr("ry", yScale.step() * 0.2)
			.attr("x", (d: Date) => (canvasWidth - yScale.step()) - getWeekOffset(d) * yScale.step())
			.attr("y", (d: Date) => yScale(formatAsLocalWeekday(d)))
			.attr("width", yScale.bandwidth())
			.attr("height", yScale.bandwidth())
			
		
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
			</svg>
		</>
	)
}

export default TileChart
