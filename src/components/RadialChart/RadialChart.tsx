import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { configureGlobalControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height.js";
import type { IDataPoint } from "../../data/fakingData";


interface RadialChartData {
    data: IDataPoint[];
    width: number;
    height: number;
}

const RadialChart = ({data, width, height}: RadialChartData) => {

    const formatDateToYYYYMM = (date: Date) => `${date.toLocaleDateString([], { month: "short" })}`

    const preppedData = data.map(d => {
        return {
            category: formatDateToYYYYMM(d.date),
            author: d.author.login,
            minutes: d.duration.minutes
        }
    })


    const categories = d3.sort(d3.union(preppedData.map(d => d.category)))
    const series = d3.union(preppedData.map(d => d.author).sort())

    const stackingFunction = (entries: { category: string, author: string, minutes: number}[]) => {
        const category = entries[0].category
        const totalMinutesByAuthor = d3.rollup(
            entries,
            D => d3.sum(D, d => d.minutes),
            d => d.author
        )

        // so order is established
        const authors = d3.intersection(series, totalMinutesByAuthor.keys())

        let currentValue = 0

        const stacked: dataPoint[] = Array.from(authors).map(author => {
            const valueByAuthor = totalMinutesByAuthor.get(author) || 0
            const object = {
                category,
                author,
                value: Number(valueByAuthor) || 0,
                start: Number(currentValue),
                end: Number(currentValue + valueByAuthor)
            }
            currentValue += valueByAuthor
            return object
        })
        return stacked
    }

    const stackedValuesByCategoryAndPerson = d3.flatRollup(preppedData,
        D => stackingFunction(D),
        d => d.category
    )

    const flattened = d3.map(stackedValuesByCategoryAndPerson, d => d[1]).flat()

    const byPerson = d3.index(
        flattened,
        d => d.author,
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
            .data(categories)
            .join(
                enter => enter.append("g"),
                update => update.attr("fill", "gray"),
                exit => exit.remove()
            )
            .attr("transform", d => `
              rotate(${((Number(xScale(d)) + xScale.bandwidth() / 2) * 180 / Math.PI - 90)})
              translate(${innerRadius},0)
            `)
            .call(g => g.append("line")
                .attr("x2", -5)
                .attr("stroke", "#000"))
            .call(g => g.append("text")
                .attr("class", "label")
                .attr("transform", d => (Number(xScale(d)) + xScale.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                    ? "rotate(90)translate(0,16)"
                    : "rotate(-90)translate(0,-9)")
                .text(d => d));

        // A group for each series, and a rect for each element in the series

        const seriesGroups = svg
            .select("g.canvas")
            .selectAll("g.series")
            .data(byPerson.keys())
            .join(
                enter => enter.append("g"),
                update => update.attr("class", "updated"),
                exit => exit.remove()
            )
            .attr("fill", d => colorScale(d))
            .attr("id", d => d)

        seriesGroups.selectAll("path")
            .data((d: string): InternMap<string, dataPoint> | [] => {
                const personDatapoints = byPerson.get(d)

                if (!personDatapoints) {
                    return [];
                }

                return personDatapoints;
            })
            .join("path")
            .attr("timeslot", datapoint => datapoint[0])
            .attr("d", datapoint => arc(datapoint[1]))


    }, [data, width, height]);


    return (
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
    )
}

export default RadialChart
