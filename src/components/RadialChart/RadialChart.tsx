import {useRef, useEffect, useState} from "react";
import * as d3 from "d3";

export type dataPoint = {
    x: number;
    y: number;
}

interface RadialChartData {
    data: dataPoint[];
    width: number;
    height: number;
}


const RadialChart = ({ data, width, height }: RadialChartData) => {
    console.log(data[0])
    const svgRef = useRef<SVGSVGElement>(null);
    const margin = {
        left: 25,
        top: 25,
        right: 25,
        bottom: 25
    };

    const canvasWidth = width - margin.left - margin.right;
    const canvasHeight = height - margin.top - margin.bottom;

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        const xScale = d3
            .scaleLinear()
            .domain([0, 100])
            .range([0, canvasWidth]);

        const yScale = d3
            .scaleLinear()
            .domain([0, 100])
            .range([canvasHeight, 0]);

        const canvas = svg.select("g.canvas");

        canvas
            .selectAll<SVGRectElement, dataPoint>("rect")
            .data(data)
            .join("rect")
            .attr("x", d => xScale(d.x))
            .attr("y", d => yScale(d.y))
            .attr("width", 2)
            .attr("height", 2);

        svg.select(".axes g.x").selectChildren().remove()
        svg.select(".axes g.x").append("g").attr("class", "x").call(d3.axisBottom(xScale));

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
        </svg>
    )
}

export default RadialChart
