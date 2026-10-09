import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import Button from "@jetbrains/ring-ui-built/components/button/button.js";
import ButtonGroup from "@jetbrains/ring-ui-built/components/button-group/button-group";
import ButtonToolbar from "@jetbrains/ring-ui-built/components/button-toolbar/button-toolbar";
import {useResize} from "@react-spring/web";
import type {ScaleLinear} from "d3";

interface IInteractiveChartData {
    from: Date;
    to: Date;
}

const InteractiveChart = ({from, to}: IInteractiveChartData) => {
    const margin = {
        left: 50,
        top: 50,
        right: 25,
        bottom: 25
    };

    const [canvasWidth, setCanvasWidth] = useState(document.documentElement.clientWidth);
    const [canvasHeight, setCanvasHeight] = useState(document.documentElement.clientHeight);

    // process data
    const [renderedData, setRenderedData] = useState(null)
    const resizeWidth = () => {
        console.log("resize width");
    }

    // init function
    const init = () => {
        console.log("HiiiiIIIIII");
    }


    const svgRef = useRef<SVGSVGElement>(null);
    const gAxes = useRef<SVGGElement>(null);
    let xScale = null;

    const initializeAxes = () => {
        const svg = d3.select(svgRef.current);
        const axesGroup = svg.select("g.axes");

        axesGroup.append("g")
                .attr("class", "x axis")
                .attr("transform", `translate(0, ${canvasHeight})`);

        axesGroup.append("g")
            .attr("class", "y axis");
    }


    useEffect(() => {
        init()
        initializeAxes()

        // making a scale
        xScale = d3.scaleLinear()
            .domain([0, 150])
            .range([0, canvasHeight])
            .nice();
        d3.select<SVGGElement, string>("g.axes g.x")
            .call(d3.axisBottom(xScale))
    }, []);

    const changeDomain = () => {
        console.log(xScale.domain());
        if (!xScale)
            return
        const randomInt = Math.floor(Math.random() * 500);
        xScale.domain([0, randomInt]);
        d3.select<SVGGElement, string>("g.axes g.x")
            .transition()
            .duration(750)
            .call(d3.axisBottom(xScale))
    }

    return (
        <>
            <button onClick={changeDomain}>Change domain of x</button>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${canvasWidth + margin.left + margin.right} ${canvasHeight + margin.bottom + margin.top}`}
            >

                <g
                    ref={gAxes}
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

export default InteractiveChart;
