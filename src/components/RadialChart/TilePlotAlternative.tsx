import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { configureGlobalControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height.js";
import type { IDataPoint } from "../../data/fakingData";
import DataPoint from "../../data/fakingData";
import Select from "@jetbrains/ring-ui-built/components/select/select.js";
import Button from "@jetbrains/ring-ui-built/components/button/button.js";
import { giniIndex, distributionDifference, getWeekdayNames } from "../../helper.js";
import ButtonGroup from "@jetbrains/ring-ui-built/components/button-group/button-group";
import ButtonToolbar from "@jetbrains/ring-ui-built/components/button-toolbar/button-toolbar";

interface RadialChartData {
    from: Date;
    to: Date;
    width: number;
    height: number;
}

const regenerateArray = (dayOptions): DataPoint[] => {
    return Array(500).fill(0).map(_ => new DataPoint(dayOptions));
}


const TilePlot = ({from, to, width, height}: RadialChartData) => {
    const allDays = d3.timeDays(from, to, 1)
    const formatDateYearISOWeek = d3.timeFormat("%Y-%V")
    const formatDateWeekday = d3.timeFormat("%u")
    const formatDateYmd = d3.timeFormat("%Y-%m-%d")
    const allWeeks = d3.union(allDays.map(date => formatDateYearISOWeek(date)))

    // store all sets
    const [rawData, _setRawData] = useState(regenerateArray(allDays))

    // filtering for e.g. ranges
    const filtered = rawData.filter(d => d)

    const [filteredData, setFilteredData] = useState(filtered)
    const allPeople = d3.union(filteredData.map(d => d.author.login).sort())
    let maxY = 100

    const [showPeople, setShowPeople] = useState(Array.from(allPeople))

    const showPerson = (person: string) => setShowPeople([ ...showPeople, person ])
    const hidePerson = (person: string) =>setShowPeople([...showPeople.filter(d => d !== person)])

    // process data
    const [renderedData, setRenderedData] = useState(null)

    const processDataForRendering = () => {
        // extract the most needed points & name them appropriately
        const preppedData: { series: string, column: string, minutes: number, row: number }[] = filteredData
            .filter(d => showPeople.includes(d.author.login) )
            .map(d => {
                return (
                    {
                        series: d.author.login,
                        date: new Date(formatDateYmd(new Date(d.date))),
                        column: formatDateYearISOWeek(new Date(d.date)),
                        row: formatDateWeekday(new Date(d.date)),
                        minutes: d.duration.minutes
                    }
                )
            })

        const series = d3.union(preppedData.map(d => d.series).sort())

        const maxPerCategory = d3.rollup(preppedData,
            D => d3.sum(D.map(d => d.minutes)),
            d => d.category
        )
        maxY = d3.max(maxPerCategory, d => d[1])

        const rollupFunction = (entries) => d3.flatRollup(entries,
            D => {
                const minutesTotal = d3.sum(D, d => d.minutes)
                const minutesByPersonAndDay = d3.rollup(entries,
                    entriesOfPerson => {
                        return d3.sum(entriesOfPerson, d => d.minutes)
                        },
                    d => d.series
                )
                const stringLabels = minutesByPersonAndDay.entries().map(([personName, minutes]) => `${personName}: ${minutes} (${(minutes / minutesTotal * 100)}%)`)
                const label = stringLabels.join("\n")
                const allPeoplesContributions = Array.from(allPeople.keys()).map(person => minutesByPersonAndDay.get(person) || 0)
                const gini = giniIndex(allPeoplesContributions)
                const object = { label, minutesTotal, minutesByPersonAndDay, giniIndex: gini }
                if (allPeople.size === 2) {
                    object["distribution"] = distributionDifference(allPeoplesContributions)
                }
                return object
            }
        )

        const summedValuesBySeriesAndCategory = d3.rollup(preppedData,
            D => rollupFunction(D),
            d => d.column,
            d => d.row
        )

        setRenderedData(summedValuesBySeriesAndCategory);
    }

    useEffect(processDataForRendering, [filteredData, showPeople])

    const svgRef = useRef<SVGSVGElement>(null);
    const margin = {
        left: 50,
        top: 50,
        right: 25,
        bottom: 25
    };

    const canvasWidth: number = width - margin.left - margin.right;
    const canvasHeight: number = height - margin.top - margin.bottom;

    const render = () => {
        if (renderedData === null)
            return

        const svg = d3.select(svgRef.current);
        const canvas = svg.select("g.canvas");
        canvas.selectChildren().remove()

        svg.select(".axes g.x").selectChildren().remove()
        svg.select(".axes g.y").selectChildren().remove()

        const xScale = d3
            .scaleBand()
            .domain(allWeeks)
            .range([0, canvasWidth]);

        xScale.padding(0.3)

        const opacityScale = d3.scaleLinear().domain([0, maxY]).range([0, 1])

        const heightOfY = xScale.step() * 7

        const yScale = d3
            .scaleBand()
            .domain(["1", "2", "3", "4", "5", "6", "7"])
            .range([0, heightOfY])
            .padding(0.3);

        svg.select("g.axes")
            .append("g")
            .attr("class", "y")
            .call(d3.axisLeft(yScale))

        svg.select("g.axes")
            .append("g")
            .attr("class", "x")
            .attr("transform", `translate(0, ${canvasHeight})`)
            .call(d3.axisBottom(xScale))

        // const colorScale = d3.scaleOrdinal()
        //     .domain(renderedData.keys())
        //     .range(renderedData.keys().map((_, i) =>
        //         d3.interpolateRdYlBu(i / (series.size - 1))
        //     ))
        //     .unknown("grey");

        const colorScaleGini = d3.scaleLinear([0, 0.5, 1], ["#FF0036", "#CC00FF", "#219BFF"])
        const colorScaleDistribution = d3.scaleLinear([0, 0.5, 1], ["#FF0036", "#ff00fa", "#0044f3"]).unknown("pink")
        // svg.select(".axes g.y").append("g").attr("class", "x").call(d3.axisLeft(yScale));

        // A group for each series, and a rect for each element in the series
        const seriesGroups = svg
            .select("g.canvas")
            .selectAll("g.columns")
            .data(renderedData.keys())
            .join(
                enter => enter.append("g"),
                update => update.attr("class", "updated"),
                exit => exit.remove()
            )
            .attr("id", d => d)
            .attr("transform", d => `translate(${xScale(d)}, 0)`)

        // now we have the weeks
        seriesGroups.selectAll("rect")
            .data(d => renderedData.get(d)) // rows
            .join(enter => enter.append("rect"))
            .attr("transform", d => `translate(0, ${yScale(d[0])})`)
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScaleDistribution(d[1].distribution))
            .attr("opacity", d => opacityScale(d[1].minutesTotal))
            .append("title")
            .text(d => d[1].label)
    }

    useEffect(render, [renderedData]);


    return (
        <>
            <div className="ring-form">
                <div className="ring-form__group">
                    <div className="ring-form__label">
                        Show empty categories
                    </div>
                    <div className="ring-form__control">
                        <ButtonGroup>
                            {Array.from(allPeople).map(person => {
                                return (
                                    <Button
                                        onClick={() => {
                                            if (showPeople.includes(person)) {
                                                hidePerson(person)
                                            } else {
                                                showPerson(person)
                                            }
                                        }}
                                        className="component"
                                        key={person}
                                        active={showPeople.includes(person)}
                                        onSelect={(e) => console.log(e)}
                                    >
                                        {person}
                                    </Button>
                                )
                            })}
                        </ButtonGroup>
                    </div>
                </div>
                <div className="ring-form__group">
                    <div className="ring-form__label">
                        Uhhh
                    </div>
                    <div className="ring-form__control">
                        <Button onClick={() => fuckwithData()}>Shuffle Shuffle</Button>
                    </div>
                </div>
            </div>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
            >

                <g
                    className="axes"
                    transform={`translate(${margin.left}, ${margin.top})`}
                >
                </g>
                <g
                    className="canvas"
                    transform={`translate(${margin.left}, ${margin.top})`}
                >

                </g>
            </svg>
        </>
    )
}

export default TilePlot
