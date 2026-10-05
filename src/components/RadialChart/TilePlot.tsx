import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { configureGlobalControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height.js";
import type { IDataPoint } from "../../data/fakingData";
import DataPoint from "../../data/fakingData";
import Select from "@jetbrains/ring-ui-built/components/select/select.js";
import Button from "@jetbrains/ring-ui-built/components/button/button.js";

interface RadialChartData {
    from: Date;
    to: Date;
    width: number;
    height: number;
}

const regenerateArray = (dayOptions): DataPoint[] => {
    return Array(100).fill(0).map(_ => new DataPoint(dayOptions));
}

const TilePlot = ({from, to, width, height}: RadialChartData) => {
    const allDays = d3.timeDays(from, to, 1)
    const ISOWEEK = d3.timeFormat("%Y-%V")
    const weekday = d3.timeFormat("%u")
    const allWeeks = d3.union(allDays.map(date => ISOWEEK(date)))

    // store all sets
    const [rawdata, _setRawData] = useState(regenerateArray(allDays))

    const [rawDataFiltered, setRawDataFiltered] = useState(rawdata)
    const [renderedData, setRenderedData] = useState(rawdata)
    const formatDate = d3.timeFormat("%Y-%m-%d")

    const preppedData = renderedData.map(d => {

        return (
            {
                series: d.author.login,
                category: formatDate(new Date(d.date)),
                minutes: d.duration.minutes
            }
        )
    })

    const series = d3.union(preppedData.map(d => d.series).sort())
    const stackingFunction = (entries: DataPoint) => d3.sum(entries, d => d.minutes)
    const summedValuesBySeriesAndCategory = d3.rollup(preppedData,
        D => stackingFunction(D),
        d => d.series,
        d => d.category
    )

    const svgRef = useRef<SVGSVGElement>(null);
    const margin = {
        left: 50,
        top: 50,
        right: 25,
        bottom: 25
    };

    const canvasWidth: number = width - margin.left - margin.right;
    const canvasHeight: number = height - margin.top - margin.bottom;

    useEffect(() => {
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

        const heightOfY = xScale.bandwidth() + xScale.step() * 6
        const maxY = Number(d3.max(rawDataFiltered.map(d => d.end)))

        const yScale = d3
            .scaleBand()
            .domain(Array(6).fill(0).map((_, i) => String(i)))
            .range([0, heightOfY]);

        svg.select("g.axes")
            .append("g")
            .attr("class", "y")
            .call(d3.axisLeft(yScale))

        svg.select("g.axes")
            .append("g")
            .attr("class", "x")
            .attr("transform", `translate(0, ${canvasHeight})`)
            .call(d3.axisBottom(xScale))

        const colorScale = d3.scaleOrdinal<string, string>()
            .domain(Array.from(series))
            .range(Array.from(series).map((_, i) =>
                d3.interpolateRdYlBu(i / (series.size - 1))
            ))
            .unknown("pink");

        const colorAlternative = d3.scaleOrdinal(d3.schemeTableau10).domain(series)

        // svg.select(".axes g.y").append("g").attr("class", "x").call(d3.axisLeft(yScale));

        // A group for each series, and a rect for each element in the series

        const seriesGroups = svg
            .select("g.canvas")
            .selectAll("g.series")
            .data(summedValuesBySeriesAndCategory.keys())
            .join(
                enter => enter.append("g"),
                update => update.attr("class", "updated"),
                exit => exit.remove()
            )
            .attr("fill", d => colorScale(d))
            .attr("id", d => d)

        seriesGroups.selectAll("rect")
            .data((d) => summedValuesBySeriesAndCategory.get(d))
            .join(enter => enter.append("rect"))
            .attr("x", d => xScale(d.week))
            .attr("y", d => yScale(d.))
            .attr("width", xScale.bandwidth())
            .attr("height", d => yScale.bandwidth())
            .attr("category", d => d)
            .append("title")
            .text(d => d.minutes)

    }, [rawdata, width, height]);


    return (
        <>
            <div className="ring-form">
                <div className="ring-form__group">
                    <div className="ring-form__label">
                        Show empty categories
                    </div>
                    <div className="ring-form__control">
                        <Select
                            className="component"
                            data={["all","within frame","no"].map((item, i) => {
                                return { key: i, label: item }
                            })}
                            onSelect={(e) => console.log(e.label)}
                        >
                        </Select>
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
                    <g
                        className="x"
                        transform={`translate(0, ${canvasHeight})`}
                    >

                    </g>
                    <g
                        className="y"
                    >

                    </g>
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
