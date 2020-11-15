import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import styled from 'styled-components'
import { Dated, LabelledColor } from './interfaces'
import CSS from 'csstype'
import colors from './colors'
import { Legend } from './Legend'

const Container = styled.div`
    flex: 1;
    max-width: 1000px;
    flex-direction: column;
    align-items: center;
    text-align: left;
    position: relative;
`

const SVG = styled.svg`
    width: 100%;
    background: white;
    border-radius: 2px;
`

const Title = styled.p`
    color: ${colors.text.onSurface};
    font-weight: 700;
    border-bottom-color: black;
    border-bottom-style: solid;
    border-bottom-width: thin;
`

interface GraphProps {
    data: Dated[][],
    title: string,
    type: string,
    style?: CSS.Properties
}

export const Graph = ({ data, title, type, style }: GraphProps) => {
    const width = 400
    const height = 265
    const margin = {top: 20, right: 30, bottom: 65, left: 55}

    const formatType: string = type === "Percent" ? ".2%" : ".0s"

    const x = d3.scaleUtc()
        .domain(d3.extent(data.flat(), d => d.date) as [Date, Date])
        .range([margin.left, width - margin.right])
        .nice()
    const y = d3.scaleLinear()
        .domain([0, d3.max(data.flat(), d => d.value)!])
        .range([height - margin.bottom, margin.top])
    const line = d3.line<Dated>()
        .x(d => x(d.date)!)
        .y(d => y(d.value)!)

    const dateParser = d3.timeFormat("%b")

    const xAxis = (g: any) => g
        .call(d3.axisBottom(x).ticks(6).tickFormat(dateParser as any).tickSizeOuter(0))

    const yAxis = (g: any) => g
        .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format(formatType)))

    const xAxisRef = (axis: any) => {
        axis && xAxis(d3.select(axis))
    }
    const yAxisRef = (axis: any) => {
        axis && yAxis(d3.select(axis))
    }

    console.log("TYPE", type)

    const lineColors = colors.graph

    const svgRef = useRef<SVGSVGElement | null>(null)

    const labels = ["Actual", "Predicted"]

    useEffect(() => {
        const bisect = (mx: any) => {
            const bisect = d3.bisector((d: Dated) => d.date).left;
            const date = x.invert(mx)
            const values = data.map(lineData => {
                const index = bisect(lineData, date, 1)
                const a = lineData[index - 1];
                const b = lineData[index];
                return b && (date.valueOf() - a.date.valueOf() > b.date.valueOf() - date.valueOf()) ? b : a;
            })
            return values
        }

        const svgElement = d3.select(svgRef.current!)

        const tooltip = svgElement.append("g")
        svgElement.on("touchmove mousemove", function(event) {
            const values: Dated[] = bisect((d3 as any).pointer(event, svgElement.node())[0])
            const { value, date } = values[0]

            tooltip
                .attr("transform", `translate(${x(date)}, ${y(value)})`)
                .call(callout, `${formatDate(date)}\n${formatValues(values, type, labels)}`)
        })

        svgElement.on("touchend mouseleave", () => tooltip.call(callout, null))
    }, [])

    const legendLabelledColors = labels.map((label, i) => {
        const color = lineColors[i]
        return {label, color} as LabelledColor
    })

    return (
        <Container 
            style={style} >
            <Title>{title}</Title>
            <Legend labelledColors={legendLabelledColors} />
            <SVG 
                viewBox={`0 0 ${width} ${height}`} 
                preserveAspectRatio="xMidYMid meet" 
                ref={svgRef}>
                { data.map((lineData, index) => {
                    const lineColorIndex = colors.graph.length - data.length + index

                    return (
                        <path
                            key={`${title}line${index}`} 
                            d={line(lineData)!} 
                            stroke={lineColors[lineColorIndex]} 
                            fill="none" 
                            strokeWidth="2" 
                            strokeMiterlimit="1">
                        </path>
                    )
                })}
                <g ref={xAxisRef} transform={`translate(0, ${height - margin.bottom})`}></g>
                <g ref={yAxisRef} transform={`translate(${margin.left},0)`}></g>
            </SVG>
        </Container>
    )
}

function formatDate(date: Date) {
    return date.toLocaleString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
    });
}

function formatValues(values: Dated[], type: string, labels: string[]) {
    const formatted = values.map((value, index) => {
        let adjustedValue = value.value
        if (type === "Percent") {
            adjustedValue *= 100
        }

        let str = adjustedValue.toLocaleString()
        if (type === "Percent") {
            str += '%'
        }
        if (values.length === 1) {
            return str
        } else {
            // This little bit of arithmetic is so that if we're just looking at the state and nation data
            // The labels are "state", "us" instead of "county", "state"
            return `${labels[index + labels.length - values.length]}: ${str}`
        }
    })
    return formatted.join('\n')
}

const callout = (g: any, value: string) => {
    if (!value) return g.style("display", "none");
  
    g
        .style("display", null)
        .style("pointer-events", "none")
        .style("font", "10px sans-serif");
  
    const path = g.selectAll("path")
      .data([null])
      .join("path")
        .attr("fill", "white")
        .attr("stroke", "black");
  
    const text = g.selectAll("text")
      .data([null])
      .join("text")
      .call((text: any) => text
        .selectAll("tspan")
        .data((value + "").split(/\n/))
        .join("tspan")
          .attr("x", 0)
          .attr("y", (d: any, i: any) => `${i * 1.1}em`)
          .style("font-weight", (_: any, i: any) => i ? null : "bold")
          .text((d: any) => d));
  
    const {y, width: w, height: h} = text.node().getBBox();
  
    text.attr("transform", `translate(${-w / 2},${15 - y})`);
    path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
  }