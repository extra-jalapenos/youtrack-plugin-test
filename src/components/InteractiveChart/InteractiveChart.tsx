import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import Button from "@jetbrains/ring-ui-built/components/button/button.js";
import ButtonGroup from "@jetbrains/ring-ui-built/components/button-group/button-group";
import { categoryColors } from "./colors.ts";
import type { Granularity, RawDataPoint } from "./types.ts";
import { aggregateByPeriod, cleanData, computeBars, granularityConfig, stackByCategory } from "./dataHelpers.ts";
import { useAnimatedBars } from "./useAnimatedBars.ts";

interface InteractiveChartProps {
    data: RawDataPoint[];
    initialGranularity?: Granularity;
}

const margin = { top: 20, right: 20, bottom: 30, left: 60 };
const height = 400;
const transitionDuration = 750;
/** Roughly how many pixels one x-axis label needs, used to skip labels when there are many periods. */
const pixelsPerLabel = 70;

const granularities = Object.keys(granularityConfig) as Granularity[];

const InteractiveChart = ({ data, initialGranularity = "month" }: InteractiveChartProps) => {
    const [granularity, setGranularity] = useState<Granularity>(initialGranularity);
    const [width] = useState(() => document.documentElement.clientWidth - margin.left - margin.right);

    const xAxisRef = useRef<SVGGElement>(null);
    const yAxisRef = useRef<SVGGElement>(null);

    // 1. Clean the data once: drop invalid dates and negative minutes
    const validData = useMemo(() => cleanData(data), [data]);
    const categories = useMemo(() => [...new Set(validData.map((d) => d.category))].sort(), [validData]);

    // 2. Sum minutes per period and category, then stack the categories
    const { format } = granularityConfig[granularity];
    const rows = useMemo(() => aggregateByPeriod(validData, granularity), [validData, granularity]);
    const series = useMemo(() => stackByCategory(rows, categories), [rows, categories]);

    // 3. Scales map data values to pixels (and categories to colors)
    const xScale = useMemo(
        () => d3.scaleBand()
            .domain(rows.map((row) => format(row.period)))
            .range([0, width])
            .padding(0.1),
        [rows, format, width],
    );
    const yScale = useMemo(() => {
        // The top of the last stacked series is the total per period
        const maxTotal = d3.max(series, (s) => d3.max(s, ([, top]) => top)) ?? 0;
        return d3.scaleLinear().domain([0, maxTotal]).range([height, 0]).nice();
    }, [series]);
    const colorScale = useMemo(() => d3.scaleOrdinal<string, string>(categories, categoryColors), [categories]);

    // 4. Turn the stack into rectangles and animate towards them
    const targetBars = useMemo(
        () => computeBars(series, xScale, yScale, format),
        [series, xScale, yScale, format],
    );
    const bars = useAnimatedBars(targetBars, height, transitionDuration);

    // Axes are drawn by d3 into the empty <g> elements below. React never renders inside them.
    useEffect(() => {
        const labels = xScale.domain();
        const step = Math.ceil(labels.length / (width / pixelsPerLabel));
        const xAxis = d3.axisBottom(xScale).tickValues(labels.filter((_, i) => i % step === 0));

        d3.select(xAxisRef.current!).transition().duration(transitionDuration).call(xAxis);
        d3.select(yAxisRef.current!).transition().duration(transitionDuration).call(d3.axisLeft(yScale));
    }, [xScale, yScale, width]);

    return (
        <div>
            <ButtonGroup>
                {granularities.map((g) => (
                    <Button key={g} active={g === granularity} onClick={() => setGranularity(g)}>
                        {granularityConfig[g].label}
                    </Button>
                ))}
            </ButtonGroup>

            <ul style={{ display: "flex", gap: 16, listStyle: "none", padding: 0 }}>
                {categories.map((category) => (
                    <li key={category}>
                        <svg width={10} height={10} style={{ marginRight: 4 }}>
                            <rect width={10} height={10} fill={colorScale(category)} />
                        </svg>
                        {category}
                    </li>
                ))}
            </ul>

            <svg viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}>
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    <g className="bars">
                        {bars.map((bar) => (
                            <rect
                                key={bar.key}
                                x={bar.x}
                                y={bar.y}
                                width={bar.width}
                                height={bar.height}
                                fill={colorScale(bar.category)}
                            />
                        ))}
                    </g>
                    <g ref={xAxisRef} className="x-axis" transform={`translate(0, ${height})`} />
                    <g ref={yAxisRef} className="y-axis" />
                    <text transform="rotate(-90)" x={-height / 2} y={-margin.left + 14} textAnchor="middle" fontSize={12}>
                        Minutes
                    </text>
                </g>
            </svg>
        </div>
    );
};

export default InteractiveChart;
