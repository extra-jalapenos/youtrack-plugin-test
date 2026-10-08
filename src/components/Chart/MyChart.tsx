import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import DataPoint from "../../data/fakingData.js";
import "./contribution-colors.css"
import Button from "@jetbrains/ring-ui-built/components/button/button.js";
import { compareContributionToRest } from "../../helper.js";
import ButtonGroup from "@jetbrains/ring-ui-built/components/button-group/button-group";
import ButtonToolbar from "@jetbrains/ring-ui-built/components/button-toolbar/button-toolbar";

interface MyChartData {
    from: Date;
    to: Date;
}

const regenerateArray = (dayOptions): DataPoint[] => {
    return Array(dayOptions.length*7).fill(0).map(_ => new DataPoint(dayOptions));
}


const MyChart = ({from, to}: MyChartData) => {
    const margin = {
        left: 50,
        top: 50,
        right: 25,
        bottom: 25
    };

    const differentWeeksCount = d3.union([from, ...d3.utcMondays(from, to, 1), to]).size

    // store all sets
    const allDays = d3.timeDays(from, to, 1);
    const [rawData, _setRawData] = useState(regenerateArray(allDays));


    const [cellSize, setCellSize] = useState(20)
    const [canvasWidth, setCanvasWidth] = useState(differentWeeksCount * cellSize)
    const [canvasHeight, setCanvasHeight] = useState(cellSize * 7)

    const [filteredData, setFilteredData] = useState([])
    const [allPeople, setAllPeople] = useState<Set<string>>(new Set())
    const [showPeople, setShowPeople] = useState([])
    const [perspectivePerson, setPerspective] = useState(showPeople.length ? showPeople[0] : "")

    // process data
    const [renderedData, setRenderedData] = useState(null)

    const resizeWidth = () => {
        if (rawData.length === 0)
            return
        const maxCanvasWidth: number = parent.innerWidth - margin.left - margin.right;
        const neededWidth: number = cellSize * differentWeeksCount;
        const smallerValue = d3.min([maxCanvasWidth, neededWidth]);
        setCanvasWidth(d3.min([maxCanvasWidth, neededWidth]));

        const fittingColumns = Math.floor(maxCanvasWidth / 20);
        const dateXWeeksAgo = new Date(to.getFullYear(), to.getUTCMonth(), to.getDate() - fittingColumns * 7)

        const shownWeeks = d3.union([dateXWeeksAgo, ...d3.utcMondays(dateXWeeksAgo, to, 1), to].map(date => formatDateYearISOWeek(date)))
        const shownDays = d3.extent(allDays.filter(day => shownWeeks.has(formatDateYearISOWeek(day))))

        const filtered = rawData.filter(d => d.date >= shownDays[0].getTime() && d.date <= shownDays[1].getTime())
        setAllPeople(d3.union(rawData.map(d => d.author.login).sort()))
        setFilteredData(filtered)
    };


    // filtering for e.g. ranges
    useEffect(() => {
        if (rawData)
            resizeWidth()
        else
            console.log("no rendered data, no resizing")
    }, [])

    useEffect(() => window.addEventListener("resize", resizeWidth), [])

    const formatDateWeekday = d3.timeFormat("%u")
    const formatDateYearISOWeek = d3.timeFormat("%G-%V");
    const formatDateYmd = d3.timeFormat("%Y-%m-%d");

    const allWeeks = d3.union([from, ...d3.utcMondays(from, to, 1), to].map(date => formatDateYearISOWeek(date)));


    type preppedDataPoint = { series: string, date: Date, column: string, minutes: number, row: string }
    const processDataForRendering = () => {
        // extract the most needed points & name them appropriately
        const preppedData: preppedDataPoint[] = filteredData
            .map(d => {
                return (
                    {
                        series: d.author.login,
                        date: new Date(d.date),
                        column: formatDateYearISOWeek(new Date(d.date)),
                        row: formatDateWeekday(new Date(d.date)),
                        minutes: d.duration.minutes
                    }
                )
            })

        const series = d3.union(preppedData.map(d => d.series).sort())
        const averageContributionByDay = d3.rollup(preppedData,
            D => d3.sum(D.map(d => d.minutes)) / D.length,
            d => d.date
        )

        const maxPerCategory = d3.rollup(preppedData,
            D => d3.sum(D.map(d => d.minutes)),
            d => d.date
        )

        const rollupFunction = (entries: preppedDataPoint[]) => d3.flatRollup(entries,
            D => {
                const minutesTotal = d3.sum(D, d => d.minutes)
                const minutesByPersonAndDay = d3.rollup(entries,
                    entriesOfPerson => {
                        return d3.sum(entriesOfPerson, d => d.minutes)
                        },
                    d => d.series
                )
                const dateString = D[0].date.toLocaleDateString(["de-DE"])
                const allOtherPeople =  Array.from(allPeople.keys())
                    .filter(person => person !== perspectivePerson)

                const focusPersonContribution = minutesByPersonAndDay.get(perspectivePerson) || 0
                const allPeoplesContributions = allOtherPeople.map(person => minutesByPersonAndDay.get(person) || 0)
                const averageContribution = d3.sum(allPeoplesContributions) / allOtherPeople.length

                const contribution = compareContributionToRest([focusPersonContribution, averageContribution])
                const stringLabels = Array.from(minutesByPersonAndDay.entries())
                                        .map(([personName, minutes]) => `${personName}: ${minutes} (${(minutes / minutesTotal * 100).toFixed(0)} %)`)
                const label = dateString + "\n" + `${perspectivePerson}: ${minutesByPersonAndDay.get(perspectivePerson)|| 0} \n\n` + stringLabels.join("\n")
                + "\n\n" + `avg: ${averageContribution.toFixed(0)} minutes, contribution: ${contribution}`
                const object = { label, minutesTotal, minutesByPersonAndDay, contribution: contribution }

                return object
            }
        )

        const summedValuesBySeriesAndCategory = d3.rollup(preppedData,
            D => rollupFunction(D),
            d => d.column,
            d => d.row
        )
        setRenderedData(summedValuesBySeriesAndCategory);
    }

    useEffect(processDataForRendering, [filteredData, showPeople, perspectivePerson])

    const svgRef = useRef<SVGSVGElement>(null);

    const render = () => {
        console.log("render start")
        if (renderedData === null || renderedData.size === 0) {
            console.log(renderedData)

            console.log("render abort")
            return
        }

        console.log("really rendering now")
        const svg = d3.select(svgRef.current);

        const canvas = svg.select("g.canvas");
        canvas.selectChildren().remove()

        svg.select(".axes g.x").selectChildren().remove()
        svg.select(".axes g.y").selectChildren().remove()

        const weeks = Array.from(renderedData.keys()).sort()
        const xScale = d3
            .scaleBand()
            .domain(d3.union(weeks))
            .range([0, canvasWidth]);

        xScale.padding(0.3)

        const xScaleTime = d3.scaleTime()
            .domain(d3.extent(allDays))
            .range([0, canvasWidth]);


        const contributionCategories = [
            "nothing",
            "very little",
            "less",
            "equally",
            "more",
            "most",
            "everything"
        ];

        const labelContribution = d3.scaleQuantize([0, 1], contributionCategories)

        const opacityScale = d3.scaleLinear().domain([0, 1]).range([0, 1])

        const heightOfY = xScale.step() * 7

        const yScale = d3
            .scaleBand()
            .domain(["1", "2", "3", "4", "5", "6", "7"])
            .range([0, canvasHeight])
            .padding(0.3);

        svg.select("g.axes")
            .append("g")
            .attr("class", "y")
            .call(d3.axisLeft(yScale))

        svg.select("g.axes")
            .append("g")
            .attr("class", "x")
            .attr("transform", `translate(0, ${canvasHeight})`)
            .call(d3.axisBottom(xScaleTime).ticks(2))

        // const colorScale = d3.scaleOrdinal()
        //     .domain(renderedData.keys())
        //     .range(renderedData.keys().map((_, i) =>
        //         d3.interpolateRdYlBu(i / (series.size - 1))
        //     ))
        //     .unknown("grey");

        const colorScaleGini = d3.scaleLinear([0, 0.5, 1], ["#FF0036", "#CC00FF", "#219BFF"])

        const colorScaleDistribution = d3.scaleDiverging(["#00061F", "#00FF41", "white"]);
        // svg.select(".axes g.y").append("g").attr("class", "x").call(d3.axisLeft(yScale));

        // A group for each series, and a rect for each element in the series
        const seriesGroups = svg
            .select("g.canvas")
            .selectAll("g.columns")
            .data(renderedData.keys())
            .join(
                enter => enter.append("g"),
                update => update.attr("class", "updated"),
                exit => exit.remove()
            )
            .attr("id", d => d)
            .attr("transform", d => `translate(${xScale(d)}, 0)`)

        // now we have the weeks
        seriesGroups.selectAll("rect")
            .data(d => renderedData.get(d)) // rows
            .join(enter => enter.append("rect"))
            .attr("transform", d => `translate(0, ${yScale(d[0])})`)
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", cellSize / 5)
            .attr("ry", cellSize / 5)
            .attr("width", cellSize * 0.8)
            .attr("height", cellSize * 0.8)
            .attr("class", d => labelContribution(d[1].contribution))
            .attr("fill", d => colorScaleDistribution(d[1].contribution))
            .append("title")
            .text(d => d[1].label + "\n" + labelContribution(d[1].contribution))
    }

    useEffect(render, [renderedData]);

    return (
        <>
            <p>Compare</p>
            <ButtonToolbar>
                <ButtonGroup>
                    {Array.from(allPeople)
                        .map(person => {
                            return (
                                <Button
                                    onClick={() => setPerspective(person)}
                                    key={person}
                                    active={perspectivePerson === person}
                                    onSelect={(e) => console.log(e)}
                                >
                                    {person}
                                </Button>
                            )
                        })
                    }
                </ButtonGroup>
            </ButtonToolbar>

            <svg
                ref={svgRef}
                viewBox={`0 0 ${canvasWidth + margin.left + margin.right} ${canvasHeight + margin.bottom + margin.top}`}
            >

                <g
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

export default MyChart;
