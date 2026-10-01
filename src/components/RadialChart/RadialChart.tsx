import {useRef, useEffect, useState} from "react";
import * as d3 from "d3";
import {configureGlobalControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height.js";

export type dataPoint = {
    duration: {
        minutes: number
    };
    category?: string;
    author: {
        login: string;
    };
    date: Date
}

interface RadialChartData {
    data: dataPoint[];
    width: number;
    height: number;
}

const RadialChart = ({data, width, height}: RadialChartData) => {

    const formatDateToYYYYMM = (date: Date) => `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`

    const preppedData = d3.map(data, d => ({ ...d, category: formatDateToYYYYMM(d.date) }))
    const categories = d3.union(preppedData, d => d.category.sort())
    console.log(preppedData)
    const series = d3.union(data.map(d => d.author.login).sort())

    const stackingFunction = (entries: dataPoint[]) => {
        const category = entries[0].category
        const totalMinutesByAuthor = d3.rollup(
            entries,
            D => d3.sum(D, d => d.duration.minutes),
            d => d.author.login
        )

        // so order is established
        const authors = d3.intersection(series, totalMinutesByAuthor.keys())

        let currentValue = 0
        const stacked = Array.from(authors).map(author => {
            const valueByAuthor = totalMinutesByAuthor.get(author) || 0
            const object = { category, author, value: valueByAuthor, start: currentValue, end: currentValue + valueByAuthor}
            currentValue += valueByAuthor
            return object
        })
        return stacked
    }

    const stackedValuesByCategoryAndPerson = d3.flatRollup(data,
        D => stackingFunction(D),
        d => d.category
    )

    console.log(stackedValuesByCategoryAndPerson)
    const flattened = d3.map(stackedValuesByCategoryAndPerson, d => d[1]).flat()

    const byPerson = d3.index(
        flattened,
        d => d.author,
        d => d.category
    )

    // const testStacking=stackyStack(); // group by stack then series key
    // console.log(testStacking)
    const svgRef = useRef<SVGSVGElement>(null);
    const margin = {
        left: 25,
        top: 25,
        right: 25,
        bottom: 25
    };


    const canvasWidth = width - margin.left - margin.right;
    const canvasHeight = height - margin.top - margin.bottom;

    // const innerRadius = 180
    const innerRadius = canvasWidth * 0.333;
    const outerRadius = Math.min(canvasWidth, canvasHeight) / 2;

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        const xScale = d3
            .scaleBand()
            .domain(categories.values())
            .range([0, 2 * Math.PI])
            .align(0);

        const yScale = d3
            .scaleRadial()
            .domain([0, 100])
            .range([innerRadius, outerRadius]);


        const arc = d3.arc<{ date: string, author: string, start: number, end: number }>()
            .innerRadius(d => yScale(d.start))
            .outerRadius(d => yScale(d.end))
            .startAngle(d => xScale(d.date))
            .endAngle(d => xScale("2025-Q1") + xScale.bandwidth())
            .padAngle(1.5 / innerRadius)
            .padRadius(innerRadius);


        const testDataPoint = {date: "2025-Q1", start: 2, end: 100}
        console.log(arc(testDataPoint))

        const color = d3.scaleOrdinal()
            .domain(series)
            .range(Array.from(series).map((_, i) =>
                d3.interpolateBrBG(i / (series.size - 1))
            ));

        const canvas = svg.select("g.canvas");


        // canvas
        //     .selectAll<SVGRectElement, dataPoint>("rect")
        //     .data(data)
        //     .join("rect")
        //     .attr("x", d => xScale(d.x))
        //     .attr("y", d => yScale(d.y))
        //     .attr("width", 2)
        //     .attr("height", 2);

        // x axis
        svg.select("g.axes").append("g")
            .attr("text-anchor", "middle")
            .selectAll()
            .data(xScale.domain())
            .join("g")
            .attr("class", "x")
            .attr("transform", d => `
              rotate(${((xScale(d) + xScale.bandwidth() / 2) * 180 / Math.PI - 90)})
              translate(${innerRadius},0)
            `)
            .call(g => g.append("line")
                .attr("x2", -5)
                .attr("stroke", "#000"))
            .call(g => g.append("text")
                .attr("transform", d => (xScale(d) + xScale.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                    ? "rotate(90)translate(0,16)"
                    : "rotate(-90)translate(0,-9)")
                .text(d => d));

        // A group for each series, and a rect for each element in the series

        svg
            .select("g.canvas")
            .selectAll("g.series")
            .data(byPerson.keys())
            .join("g")
            .attr("fill", d => color(String(d)))
            .selectAll("path")
            .data(person => byPerson.get(person).keys())
            .join("path")
            .attr("timeslot", key => key)
        // .attr("d", datapoint => console.log(datapoint))
        // .append("title")
        //   .text(d => `${d.data[0]} ${d.key}\n${formatValue(d.data[1].get(d.key).population)}`);

        svg.select(".axes g.x").selectChildren().remove()
        // svg.select(".axes g.x").append("g").attr("class", "x").call(d3.axisBottom(xScale));

        svg.select(".axes g.y").selectChildren().remove()
        svg.select(".axes g.y").append("g").attr("class", "x").call(d3.axisLeft(yScale));

    }, [data, width, height]);


    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
        >
            <g
                className="canvas"
                transform={`translate(${margin.left}, ${margin.top})`}
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
