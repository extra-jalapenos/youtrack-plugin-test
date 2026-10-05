// from lightest to darkest
export const youTrackGrey = ["#e6e6e6",  "#bababa",  "#878787",  "#4d4d4d",  "#1a1a1a"];
export const youTrackGreen = ["#e6f6cf",  "#b7e281",  "#7dbd36",  "#409600",  "#246512"];
export const youTrackCyan = ["#d8f7f3",  "#92e1d5",  "#25beb2",  "#2f9890",  "#00665e"];
export const youTrackBlue = ["#e0f1fb",  "#a6e0fc",  "#42a3df",  "#0070e4",  "#0050a1"];
export const youTrackPink = ["#fce5f1",  "#ffc8ea",  "#ff7bc3",  "#dc0083",  "#900052"];
export const youTrackOrange = ["#ffee9c",  "#fed74a",  "#ff7123",  "#e30000",  "#8e1600"];
export const youTrackBrown = ["#f7e9c1",  "#e0c378",  "#ce6700",  "#8d5100",  "#553000"];

// by row / saturation
export const [
	youTrackMaxPastel,
	youTrackPastel,
	youTrackVibrant,
	youTrackMuted,
	youTrackDarkest
] = Array(5).fill(0).map((_, i) => {
		return [
			youTrackGreen[i],
			youTrackCyan[i],
			youTrackBlue[i],
			youTrackPink[i],
			youTrackOrange[i],
			youTrackBrown[i]
		]
	})

export const youtrackRainbow = [
	youTrackGreen,
	youTrackCyan,
	youTrackBlue,
	youTrackPink,
	youTrackOrange
].map(colors => colors.slice(1,5)).map((sliced, i) => i % 2 ? sliced.reverse() : sliced).flat()

export const createDivergingScale = (firstScale, secondScale) => [...firstScale.slice().reverse(), ...secondScale]

export const youTrackGreenToPink = createDivergingScale(youTrackGreen, youTrackPink)
export const youTrackTrueRainbow = [
	youTrackPink[2],
	youTrackPink.slice(3, 4),
	youTrackOrange.slice(1,4).reverse(),
	youTrackOrange[1],
	youTrackGreen[2],
	youTrackCyan[2],
	youTrackBlue.slice(2, 5),
	youTrackPink[4],
	youTrackPink[2]
].flat()
