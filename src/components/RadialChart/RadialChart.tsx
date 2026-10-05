import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { configureGlobalControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height.js";
import type { IDataPoint } from "../../data/fakingData";
import DataPoint from "../../data/fakingData";
import Select from "@jetbrains/ring-ui-built/components/select/select.js";


interface RadialChartData {
    from: Date;
    to: Date;
    width: number;
    height: number;
}


const regenerateArray = (): DataPoint[] => {
    return Array(100).fill(0).map(_ => new DataPoint());
}

const RadialChart = ({from, to, width, height}: RadialChartData) => {
    const [data, _setData] = useState(regenerateArray())
    const [showEmptySlots, setShowEmptySlots] = useState<"all"|"within filled slots"|"no">("all")
    const [granularity, _setGranularity] = useState<"day"|"week"|"month"|"year">("month")

    const granularityOptions = [
        {
            "key": "day",
            "label": "day",
            "formattingStringCategories": "%Y-%m-%d",
            "formattingStringTicks": "%A"
        },
        {
            "key": "weekday",
            "label": "weekday",
            "formattingStringCategories": "%A",
            "formattingStringTicks": "%A"
        },
        {
            "key": "week",
            "label": "week",
            "formattingStringCategories": "%Y-%V",
            "formattingStringTicks": "%V"
        },
        {
            "key": "month",
            "label": "month",
            "formattingStringCategories": "%Y-%B",
            "formattingStringTicks": "%b"
        },
        {
            "key": "year",
            "label": "year",
            "formattingStringCategories": "%Y",
            "formattingStringTicks": "%Y"
        }
    ]

    const granularityOptionsMap = new Map(granularityOptions.map(option => [option.key, option]))
    const allDays = d3.timeDays(from, to, 1)
    const categoryFormattingFunction = d3.timeFormat(granularityOptionsMap.get(granularity).formattingStringCategories)

    const tickFormattionFunction = d3.timeFormat(granularityOptionsMap.get(granularity).formattingStringTicks)
    const xCategories = d3.union(allDays.map(date => ({ category: categoryFormattingFunction(date), tickLabel: tickFormattionFunction(date) })))

    const preppedData = data.map(d => {
        const customFields = d.issue.customFields
        const location = customFields.find(cf => cf.name === "location")
        return {
            category: categoryFormattingFunction(new Date(d.date)),
            series: location ? location.value.name : "no location",
            minutes: d.duration.minutes
        }
    })


    const categories = d3.union(preppedData.map(d => d.category))
    const series = d3.union(preppedData.map(d => d.series).sort())

    const stackingFunction = (entries: { category: string, series: string, minutes: number}[]) => {
        const category = entries[0].category
        const totalMinutesBySeries = d3.rollup(
            entries,
            D => d3.sum(D, d => d.minutes),
            d => d.series
        )

        // so order is established
        const presentSeries = d3.intersection(series, totalMinutesBySeries.keys())

        let currentValue = 0

        const stacked = Array.from(presentSeries).map(serie => {
            const valueByAuthor = totalMinutesBySeries.get(serie) || 0
            const object = {
                category,
                series: serie,
                value: Number(valueByAuthor) || 0,
                start: Number(currentValue),
                end: Number(currentValue + valueByAuthor)
            }
            currentValue += valueByAuthor
            return object
        })
        return stacked
    }

    const stackedValuesByCategoryAndSeries = d3.flatRollup(preppedData,
        D => stackingFunction(D),
        d => d.category
    )

    const flattened = d3.map(stackedValuesByCategoryAndSeries, d => d[1]).flat()

    const bySeries = d3.index(
        flattened,
        d => d.series,
        d => d.category
    )

    const svgRef = useRef<SVGSVGElement>(null);
    const margin = {
        left: 25,
        top: 25,
        right: 25,
        bottom: 25
    };


    const canvasWidth: number = width - margin.left - margin.right;
    const canvasHeight: number = height - margin.top - margin.bottom;

    // const innerRadius = 180
    const innerRadius: number = canvasWidth * 0.2;
    const outerRadius: number = Math.min(canvasWidth, canvasHeight) / 2;

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const canvas = svg.select("g.canvas");
        canvas.selectChildren().remove()

        svg.select(".axes g.x").selectChildren().remove()
        svg.select(".axes g.y").selectChildren().remove()

        const xScale = d3
            .scaleBand()
            .domain(d3.map(xCategories, d => d.category))
            .range([0, 2 * Math.PI])
            .align(0);

        const maxY = Number(d3.max(flattened.map(d => d.end)))
        const yScale = d3
            .scaleRadial()
            .domain([0, maxY])
            .range([innerRadius, outerRadius]);

        const arc = d3.arc<dataPoint>()
            .innerRadius(d => yScale(d.start))
            .outerRadius(d => yScale(d.end))
            .startAngle(d => Number(xScale(d.category)))
            .endAngle(d => Number(xScale(d.category)) + xScale.bandwidth())
            .padAngle(1.5 / innerRadius)
            .padRadius(innerRadius);

        const colorScale = d3.scaleOrdinal<string, string>()
            .domain(Array.from(series))
            .range(Array.from(series).map((_, i) =>
                d3.interpolateRdYlBu(i / (series.size - 1))
            ))
            .unknown("pink");

        // svg.select(".axes g.y").append("g").attr("class", "x").call(d3.axisLeft(yScale));

        // x axis
        svg.select("g.axes g.x")
            .attr("text-anchor", "middle")
            .attr("class", "x")
            .selectAll()
            .data(xCategories)
            .join(
                enter => enter.append("g"),
                update => update.attr("fill", "gray"),
                exit => exit.remove()
            )
            .attr("transform", d => `
              rotate(${((Number(xScale(d.category)) + xScale.bandwidth() / 2) * 180 / Math.PI - 90)})
              translate(${innerRadius},0)
            `)
            .call(g => g.append("line")
                .attr("x2", -5)
                .attr("stroke", "#000"))
            .call(g => g.append("text")
                .attr("class", "label")
                .attr("transform", d => (Number(xScale(d.category)) + xScale.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                    ? "rotate(90)translate(0,16)"
                    : "rotate(-90)translate(0,-9)")
                .text(d => d.tickLabel));

        // A group for each series, and a rect for each element in the series

        const seriesGroups = svg
            .select("g.canvas")
            .selectAll("g.series")
            .data(bySeries.keys())
            .join(
                enter => enter.append("g"),
                update => update.attr("class", "updated"),
                exit => exit.remove()
            )
            .attr("fill", d => colorScale(d))
            .attr("id", d => d)

        seriesGroups.selectAll("path")
            .data((d: string): d3.InternMap<string, DataPoint> | [] => {
                const seriesDatapoints = bySeries.get(d)

                if (!seriesDatapoints) {
                    return [];
                }

                return seriesDatapoints;
            })
            .join("path")
            .attr("timeslot", datapoint => datapoint[0])
            .attr("d", datapoint => arc(datapoint[1]))


    }, [data, width, height]);


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
      </div>
        <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
        >
            <g
                className="canvas"
                transform={`translate(${margin.left + canvasWidth / 2}, ${margin.top + canvasHeight / 2})`}
            >

            </g>
            <g
                className="axes"
                transform={`translate(${margin.left + canvasWidth / 2}, ${margin.top + canvasHeight / 2})`}
            >
                <g
                    className="x"
                >

                </g>
                <g
                    className="y"
                >

                </g>
            </g>
        </svg>
      </>
    )
}

export default RadialChart
