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

const RadialChart = ({from, to, width, height}: RadialChartData) => {
    const allDays = d3.timeDays(from, to, 1)
    const [rawdata, _setRawData] = useState(regenerateArray(allDays))

    const fuckwithData = () => {
        const mod = rawdata.map(item => ({ ...item, minutes: Math.random() * 10 }))
        _setRawData(mod)
    }
    const [renderedData, setRenderedData] = useState(rawdata)
    const [showEmptySlots, setShowEmptySlots] = useState<"all"|"within filled slots"|"no">("all")
    const [granularity, _setGranularity] = useState<"day"|"weekday"|"week"|"month"|"year">("week")

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
            "formattingStringCategories": "%V",
            "formattingStringTicks": "%V"
        },
        {
            "key": "month",
            "label": "month",
            "formattingStringCategories": "%Y-%b",
            "formattingStringTicks": "%y-%b"
        },
        {
            "key": "year",
            "label": "year",
            "formattingStringCategories": "%Y",
            "formattingStringTicks": "%Y"
        }
    ]

    const granularityOptionsMap = new Map(granularityOptions.map(option => [option.key, option]))

    const categoryFormattingFunction = d3.timeFormat(granularityOptionsMap.get(granularity).formattingStringCategories)

    const tickFormattionFunction = d3.timeFormat(granularityOptionsMap.get(granularity).formattingStringTicks)

    const categories = d3.union(allDays.map((date: Date) => categoryFormattingFunction(date)))

    const preppedData = rawdata.map(d => {
        const customFields = d.issue.customFields
        const location = customFields.find(cf => cf.name === "location")

        return {
            category: categoryFormattingFunction(new Date(d.date)) || "no category",
            series: location.value.name ? location.value.name : "no location",
            minutes: d.duration.minutes
        }
    })

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
            const valueBySeries = totalMinutesBySeries.get(serie) || 0
            const object = {
                category,
                series: serie,
                value: Number(valueBySeries) || 0,
                start: Number(currentValue),
                end: Number(currentValue + valueBySeries)
            }
            currentValue += valueBySeries
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
            .domain(categories)
            .range([0, 2 * Math.PI])
            .align(0);

        const maxY = Number(d3.max(flattened.map(d => d.end)))

        const yScale = d3
            .scaleLinear()
            .domain([0, maxY])
            .range([innerRadius, outerRadius]);

        const ticks = yScale.ticks(5)

        svg.select("g.axes").select("g.y")
            .selectAll("circle")
            .data(ticks)
            .join("circle")
            .attr("r", d => yScale(d))

        const arc = d3.arc<{ category: string, start: number, end: number }>()
            .innerRadius(d => yScale(d.start))
            .outerRadius(d => yScale(d.end))
            .startAngle(d => xScale(d.category))
            .endAngle(d => xScale(d.category) + xScale.bandwidth())
            .padAngle(2 / innerRadius)
            .padRadius(innerRadius);

        const colorScale = d3.scaleOrdinal<string, string>()
            .domain(Array.from(series))
            .range(Array.from(series).map((_, i) =>
                d3.interpolateRdYlBu(i / (series.size - 1))
            ))
            .unknown("pink");

        const colorAlternative = d3.scaleOrdinal(d3.schemeTableau10).domain(series)

        // svg.select(".axes g.y").append("g").attr("class", "x").call(d3.axisLeft(yScale));

        // x axis
        svg.select("g.axes g.x")
            .attr("text-anchor", "middle")
            .attr("class", "x")
            .selectAll()
            .data(categories)
            .join(
                enter => enter.append("g"),
                update => update.attr("fill", "gray"),
                exit => exit.remove()
            )
            .attr("transform", d => `
              rotate(${((xScale(d) + xScale.bandwidth() / 2) * 180 / Math.PI - 90)})
              translate(${innerRadius},0)
            `)
            .call(g => g.append("line")
                .attr("x2", -5))
            .call(g => g.append("text")
                .attr("class", "label")
                .attr("transform", d => (xScale(d) + xScale.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                    ? "rotate(90)translate(0,16)"
                    : "rotate(-90)translate(0,-9)")
                .text(d => d));

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
            .attr("fill", d => colorAlternative(d))
            .attr("id", d => d)

        seriesGroups.selectAll("path")
            .data((d: string) => {
                if (!bySeries.has(d)) {
                    return [];
                }

                return bySeries.get(d);
            })
            .join("path")
            .attr("category", d => d[0])
            .attr("d", (d: { category: string, start: number, end: number }) => arc(d[1]))


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
            <Button onClick={() => fuckwithData()}>Filter Data</Button>
        </div>
      </div>
      </div>
        <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
        >

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
            <g
                className="canvas"
                transform={`translate(${margin.left + canvasWidth / 2}, ${margin.top + canvasHeight / 2})`}
            >

            </g>
        </svg>
      </>
    )
}

export default RadialChart
