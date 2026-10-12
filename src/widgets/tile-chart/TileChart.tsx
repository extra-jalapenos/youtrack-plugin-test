import type { TileChartConfig } from "./types"

const TileChart = ({ data, width, height }: TileChartConfig) => {
	console.log(data)
	return(
		<svg
			width={width}
			height={height}
			viewBox={`0 0  ${width} ${height}`}
		>
			<g
				className="canvas"
			>
			</g>

			<g
				className="axes"
			>

			</g>
		</svg>
	)
}

export default TileChart
