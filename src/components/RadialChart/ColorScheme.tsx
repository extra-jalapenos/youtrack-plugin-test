import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import {
youTrackMaxPastel,
youTrackPastel,
youTrackVibrant,
youTrackMuted,
youTrackDarkest,
youtrackRainbow,

youTrackGreen,
youTrackCyan,
youTrackBlue,
youTrackPink,
youTrackOrange,
youTrackBrown,
youTrackTrueRainbow
 } from "../../youtrackColorSchemes"

const colorSchemesToRender = [
	youTrackMaxPastel,
	youTrackPastel,
	youTrackVibrant,
	youTrackMuted,
	youTrackDarkest,
	youtrackRainbow,
	youTrackGreen,
	youTrackCyan,
	youTrackBlue,
	youTrackPink,
	youTrackOrange,
	youTrackBrown,
	youTrackTrueRainbow
]
console.log(youtrackRainbow)
const colorScales = colorSchemesToRender.map(scheme => d3.scaleSequential(d3.interpolateRgbBasis(scheme)).domain([0, 100]))

const ColorScheme = () => {
	const [svgRef, _setSVGRef] = useState(null)

	useEffect(() => {
		// const svg = d3.select(svgRef.current);
		// _setSVGRef(svg)
		const svgColors = d3.select("svg.colors").attr("width", "1000").attr("height", "500")
			.attr("transform", "translate(10,10)")

		const groups = svgColors.selectAll("g")
			.data([...colorSchemesToRender])
			.enter()
			.append("g")
			.attr("transform", (d, i) => `translate(0, ${i * 40})`)

		const rectsForIndividualColors = groups.selectAll("rect")
			.data(d => d)
			.enter()
			.append("rect")
				.attr("class", "swatch")
				.attr("fill", (d) => (d))
				.attr("x", (_, i) => i * 31)
				.attr("y", 0)
				.attr("width", 30)
				.attr("height", 30)

		const svgGradients = d3.select("svg.gradients").attr("width", "1000").attr("height", "1000")
		const groupsGradients = svgGradients.selectAll("g")
		.data(colorScales)
		.enter()
		.append("g")
		.attr("transform", (d, i) => `translate(0, ${i * 40})`)
			.selectAll("rect")
			.data(d => Array(100).fill(0).map((_, i) => d(i)))
			.enter()
			.append("rect")
				.attr("class", "swatch")
				.attr("id", (_, i) => i)
				.attr("fill", (d) => (d))
				.attr("stroke-weight", 0)
				.attr("x", (_, i) => 2 * i)
				.attr("y", 0)
				.attr("width", 2)
				.attr("height", 30)

		const rectsForGradients = groupsGradients
	}, [])

	return (
		<>
		<section>
				<svg className="colors"></svg>
		</section>
		<section>
				<svg className="gradients"></svg>
		</section>
		</>
	)
}

export default ColorScheme
