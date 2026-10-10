import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { categoryColors } from "./colors.ts";
import type { BarRect, Granularity, RawDataPoint } from "./types.ts";
import { aggregateByPeriod, cleanData, computeBars, granularityConfig, levels, parentKey, stackByCategory } from "./dataHelpers.ts";
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
/** How long a click waits to see whether it becomes a double-click. */
const doubleClickDelay = 250;

const InteractiveChart = ({ data, initialGranularity = "month" }: InteractiveChartProps) => {
    // The direction tells the bars whether to split apart (down) or merge together (up)
    const [view, setView] = useState<{ granularity: Granularity; direction: "down" | "up" }>({
        granularity: initialGranularity,
        direction: "down",
    });
    const { granularity, direction } = view;
    const [width] = useState(() => document.documentElement.clientWidth - margin.left - margin.right);

    const xAxisRef = useRef<SVGGElement>(null);
    const yAxisRef = useRef<SVGGElement>(null);
    const clickTimeoutRef = useRef<number | undefined>(undefined);

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
    // When going up, every bar of the finer level moves into its parent bar of the same category
    const exitTo = useMemo(() => {
        if (direction !== "up") return undefined;
        const childLevel = levels[levels.indexOf(granularity) + 1];
        const barsByKey = new Map(targetBars.map((bar) => [bar.key, bar]));
        return (bar: BarRect) => barsByKey.get(parentKey(bar, childLevel, granularity));
    }, [direction, granularity, targetBars]);
    const bars = useAnimatedBars(targetBars, height, transitionDuration, exitTo);

    // Axes are drawn by d3 into the empty <g> elements below. React never renders inside them.
    useEffect(() => {
        const labels = xScale.domain();
        const step = Math.ceil(labels.length / (width / pixelsPerLabel));
        const xAxis = d3.axisBottom(xScale).tickValues(labels.filter((_, i) => i % step === 0));

        d3.select(xAxisRef.current!).transition().duration(transitionDuration).call(xAxis);
        d3.select(yAxisRef.current!).transition().duration(transitionDuration).call(d3.axisLeft(yScale));
    }, [xScale, yScale, width]);

    useEffect(() => () => window.clearTimeout(clickTimeoutRef.current), []);

    /** Moves one level down (+1, finer) or up (-1, coarser). Does nothing at either end. */
    const changeLevel = (step: 1 | -1) => {
        const next = levels[levels.indexOf(granularity) + step];
        if (next) setView({ granularity: next, direction: step === 1 ? "down" : "up" });
    };

    // A double-click also fires two clicks, so a click only goes down once no second click followed
    const handleAxisClick = () => {
        window.clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = window.setTimeout(() => changeLevel(1), doubleClickDelay);
    };
    const handleAxisDoubleClick = () => {
        window.clearTimeout(clickTimeoutRef.current);
        changeLevel(-1);
    };

    return (
        <div>
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
            <p style={{ fontSize: 12 }}>
                {granularityConfig[granularity].label}: click the time axis to zoom in, double-click it to zoom out.
            </p>

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
                    <g
                        transform={`translate(0, ${height})`}
                        style={{ cursor: "pointer", userSelect: "none" }}
                        onClick={handleAxisClick}
                        onDoubleClick={handleAxisDoubleClick}
                    >
                        {/* Invisible hit area, so clicks between the (skipped) labels count too */}
                        <rect width={width} height={margin.bottom} fill="transparent" />
                        <g ref={xAxisRef} className="x-axis" />
                    </g>
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
