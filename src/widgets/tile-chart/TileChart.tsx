import {useEffect, useRef, useState} from "react";
import type { TileChartConfig } from "./types"
import { select } from "d3";

const TileChart = ({ data, viewBoxWidth, viewBoxHeight }: TileChartConfig) => {

	const svgContainer = useRef<HTMLDivElement>(null);

	const [ratio, setRatio] = useState({ width: 0, height: 0 })
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
				viewBox={`-10 -10 ${viewBoxWidth} ${viewBoxHeight}`}
			>
				<rect
					x={0}
					y={0}
					width={viewBoxWidth - 20}
					height={viewBoxHeight - 20}
					fill="red"
				>

				</rect>
			</svg>
		</>
	)
}

export default TileChart
