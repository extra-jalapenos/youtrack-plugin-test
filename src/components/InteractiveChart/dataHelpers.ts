import * as d3 from "d3";
import type { BarRect, Granularity, PeriodRow, RawDataPoint, ValidDataPoint } from "./types.ts";

const parseDay = d3.utcParse("%Y-%m-%d");
const formatDay = d3.utcFormat("%Y-%m-%d");

/**
 * Parses "YYYY-MM-DD" into a UTC Date. Returns null for invalid dates.
 * JS Dates silently roll over (2023-02-29 becomes 2023-03-01), so we format the parsed date
 * back to a string. If it doesn't match the input, the date didn't exist.
 */
export const parseValidDate = (value: string): Date | null => {
    const date = parseDay(value);
    if (!date || formatDay(date) !== value) return null;
    return date;
};

/** Drops points with invalid dates and negative (or non-numeric) minutes. */
export const cleanData = (raw: RawDataPoint[]): ValidDataPoint[] =>
    raw.flatMap(({ date, minutes, category }) => {
        const parsed = parseValidDate(date);
        if (!parsed || !Number.isFinite(minutes) || minutes < 0) return [];
        return [{ date: parsed, minutes, category }];
    });

interface GranularityConfig {
    /** Button label. */
    label: string;
    /** A d3 time interval: `floor` snaps a date to the start of its period, `range` lists periods. */
    interval: d3.TimeInterval;
    /** Turns a period start into a tick label. */
    format: (periodStart: Date) => string;
    /** The date that decides which coarser period a period belongs to. Defaults to the period start. */
    anchor?: (periodStart: Date) => Date;
}

export const granularityConfig: Record<Granularity, GranularityConfig> = {
    year: {
        label: "Year",
        interval: d3.utcYear,
        format: d3.utcFormat("%Y"),
    },
    quarter: {
        label: "Quarter",
        interval: d3.utcMonth.every(3)!, // months 0, 3, 6, 9
        format: (d) => `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth() / 3) + 1}`,
    },
    month: {
        label: "Month",
        interval: d3.utcMonth,
        format: d3.utcFormat("%Y-%m"),
    },
    isoWeek: {
        label: "ISO week",
        interval: d3.utcMonday, // ISO weeks start on Monday
        format: d3.utcFormat("%G-W%V"), // %G = ISO year, %V = ISO week number
        // Like ISO assigns weeks to years, a week belongs to the month that contains its Thursday
        anchor: (d) => d3.utcDay.offset(d, 3),
    },
    day: {
        label: "Day",
        interval: d3.utcDay,
        format: d3.utcFormat("%Y-%m-%d"),
    },
};

/** Granularities from coarsest to finest. Clicking the x-axis moves one step down, double-clicking one step up. */
export const levels: Granularity[] = ["year", "quarter", "month", "isoWeek", "day"];

/** Key of the bar a bar merges into when going from `childLevel` up to `parentLevel`. Matches the keys from `computeBars`. */
export const parentKey = (bar: BarRect, childLevel: Granularity, parentLevel: Granularity): string => {
    const { anchor = (d: Date) => d } = granularityConfig[childLevel];
    const { interval, format } = granularityConfig[parentLevel];
    return `${bar.category}|${format(interval.floor(anchor(bar.period)))}`;
};

/**
 * Sums minutes per period and category. Every period between the first and last data point
 * gets a row (with 0 for missing categories), so gaps in the data show up as gaps in the chart.
 */
export const aggregateByPeriod = (data: ValidDataPoint[], granularity: Granularity): PeriodRow[] => {
    const { interval } = granularityConfig[granularity];

    // Nested Map: period start (as a timestamp) -> category -> summed minutes
    const sums = d3.rollup(
        data,
        (points) => d3.sum(points, (d) => d.minutes),
        (d) => interval.floor(d.date).getTime(),
        (d) => d.category,
    );

    const [first, last] = d3.extent(data, (d) => d.date);
    if (!first || !last) return [];

    // range() excludes its end, so step one period past the last date
    const periods = interval.range(interval.floor(first), interval.offset(interval.floor(last), 1));

    return periods.map((period) => ({
        period,
        minutesByCategory: Object.fromEntries(sums.get(period.getTime()) ?? []),
    }));
};

/** Stacks categories on top of each other: each series holds [bottom, top] values per period. */
export const stackByCategory = (rows: PeriodRow[], categories: string[]) =>
    d3.stack<PeriodRow>()
        .keys(categories)
        .value((row, category) => row.minutesByCategory[category] ?? 0)(rows);

/** Converts stacked series into pixel rectangles. */
export const computeBars = (
    series: d3.Series<PeriodRow, string>[],
    xScale: d3.ScaleBand<string>,
    yScale: d3.ScaleLinear<number, number>,
    formatPeriod: (period: Date) => string,
): BarRect[] =>
    series.flatMap((categorySeries) =>
        categorySeries.map((point) => {
            const [bottom, top] = point;
            const label = formatPeriod(point.data.period);
            return {
                key: `${categorySeries.key}|${label}`,
                category: categorySeries.key,
                period: point.data.period,
                x: xScale(label) ?? 0,
                y: yScale(top),
                width: xScale.bandwidth(),
                height: yScale(bottom) - yScale(top),
            };
        }),
    );
