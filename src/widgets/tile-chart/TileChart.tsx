import { useEffect, useState } from "react";
import type { TileChartConfig } from "./types"
import { select } from "d3";

const TileChart = ({ data, viewBoxWidth, viewBoxHeight }: TileChartConfig) => {

	const svgContainer = document.querySelector(".svgContainer")
	const [ratio, setRatio] = useState({ width: 0, height: 0 })

	const init = () => {
		const svg = select("svg")
		svg.selectAll("rect.corners")
			.data(Array(6))
			.enter()
			.append("rect")
			.attr("class", "corners")
			.attr("x", (d, i) => (i % 3) * width / 2 - 2.5 * (i % 3))
			.attr("y", (d, i) => (i % 2) * (height - 5))
			.attr("width", 5)
			.attr("height", 5)
			.attr("fill", (d, i) => ["red", "yellow", "blue"][i%3])
	}


	const printDimensions = () => {
		return
		setRatio( {
			width: document.querySelector(".svgContainer").clientWidth,
			height: document.querySelector(".svgContainer").clientHeight
		})
	}

	window.addEventListener("resize", printDimensions)

	useEffect(init, [])
	return(
		<>
			<svg
				id="svg"
				viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
				preserveAspectRatio="slice"
			>
				<rect
					x={0}
					y={0}
					width={width}
					height={height}
					fill="grey"
				>
				</rect>
				<g
					className="canvas"
				>
				</g>

				<g
					className="axes"
				>

				</g>
			</svg>
		</>
	)
}

export default TileChart
