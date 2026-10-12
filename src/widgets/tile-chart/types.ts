export type TileChartDataPoint = {
	date: Date,
	opacity: number
}

export type TileChartConfig = {
	width: number,
	height: number,
	data: TileChartDataPoint[]
}
