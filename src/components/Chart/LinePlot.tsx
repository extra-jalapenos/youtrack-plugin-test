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

const MyChart = ({from, to, width, height}: RadialChartData) => {
  const allDays = d3.timeDays(from, to, 1)
  // store all sets
  const [rawdata, _setRawData] = useState(regenerateArray(allDays))

  const [rawDataFiltered, setRawDataFiltered] = useState(rawdata)
  const [renderedData, setRenderedData] = useState(rawdata)
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
    left: 50,
    top: 50,
    right: 25,
    bottom: 25
  };

  const canvasWidth: number = width - margin.left - margin.right;
  const canvasHeight: number = height - margin.top - margin.bottom;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const canvas = svg.select("g.canvas");
    canvas.selectChildren().remove()

    svg.select(".axes g.x").selectChildren().remove()
    svg.select(".axes g.y").selectChildren().remove()

    const xScale = d3
        .scaleBand()
        .domain(categories)
        .range([0, canvasWidth]);

    xScale.padding(0.3)

    const maxY = Number(d3.max(flattened.map(d => d.end)))

    const yScale = d3
        .scaleLinear()
        .domain([0, maxY])
        .range([canvasHeight, 0])
        .nice();

    svg.select("g.axes")
        .append("g")
        .attr("class", "y")
        .call(d3.axisLeft(yScale))

    svg.select("g.axes")
        .append("g")
        .attr("class", "x")
        .attr("transform", `translate(0, ${canvasHeight})`)
        .call(d3.axisBottom(xScale))

    const colorScale = d3.scaleOrdinal<string, string>()
        .domain(Array.from(series))
        .range(Array.from(series).map((_, i) =>
            d3.interpolateRdYlBu(i / (series.size - 1))
        ))
        .unknown("pink");

    const colorAlternative = d3.scaleOrdinal(d3.schemeTableau10).domain(series)

    // svg.select(".axes g.y").append("g").attr("class", "x").call(d3.axisLeft(yScale));

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
        .join(enter => enter.append("rect"))
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d[1].end))
        .attr("width", xScale.bandwidth() - xScale.padding())
        .attr("height", d => yScale(d[1].start) - yScale(d[1].end))
        .attr("category", d => d[0])
        .append("title")
        .text(d => d[1].value)

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
              <Button onClick={() => fuckwithData()}>Shuffle Shuffle</Button>
            </div>
          </div>
        </div>
        <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
        >

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
          <g
              className="canvas"
              transform={`translate(${margin.left}, ${margin.top})`}
          >

          </g>
        </svg>
      </>
  )
}

export default MyChart
