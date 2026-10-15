export type TileChartDataPoint = {
	date: Date,
	author: string,
	minutes: number
}

export type TileChartConfig = {
	from: Date,
	to: Date,
	viewBoxWidth: number,
	viewBoxHeight: number,
	data: TileChartDataPoint[]
}
