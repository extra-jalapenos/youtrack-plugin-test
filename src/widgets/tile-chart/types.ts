export type TileChartDataPoint = {
	date: Date,
	opacity: number
}

export type TileChartConfig = {
	viewBoxWidth: number,
	viewBoxHeight: number,
	data: TileChartDataPoint[]
}
