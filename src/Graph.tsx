import React, { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import styled from 'styled-components'
import { Dated } from './interfaces'
import CSS from 'csstype'
import colors from './colors'

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
    border-style: solid;
    border-color: ${colors.text.onSurface};
    border-width: 1px;
`

interface GraphProps {
    data: Dated[][],
    title: string,
    color: string,
    type: string,
    style?: CSS.Properties
}

export const Graph = ({ data, title, color, type, style }: GraphProps) => {
    const width = 400
    const height = 200
    const margin = {top: 20, right: 20, bottom: 30, left: 40}

    const formatType: string = type === "Percent" ? ".2%" : ".0s"

    const x = d3.scaleUtc()
        .domain(d3.extent(data.flat(), d => d.date) as [Date, Date])
        .range([margin.left, width - margin.right])
    const y = d3.scaleLinear()
        .domain([0, d3.max(data.flat(), d => d.value)!])
        .range([height - margin.bottom, margin.top])
    const line = d3.line<Dated>()
        .x(d => x(d.date))
        .y(d => y((d.value)))

    const xAxis = (g: any) => g
        .call(d3.axisBottom(x).ticks(6).tickSizeOuter(0))

    const yAxis = (g: any) => g
        .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format(formatType)))

    const xAxisRef = (axis: any) => {
        axis && xAxis(d3.select(axis))
    }
    const yAxisRef = (axis: any) => {
        axis && yAxis(d3.select(axis))
    }

    const colors = [color, '#aaa', 'black']

    const svgRef = useRef<SVGSVGElement | null>(null)

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

    useEffect(() => {
        const svgElement = d3.select(svgRef.current!)

        const tooltip = svgElement.append("g")
        svgElement.on("touchmove mousemove", function(event) {
            const values: Dated[] = bisect((d3 as any).pointer(event, svgElement.node())[0])
            const { value, date } = values[0]

            tooltip
                .attr("transform", `translate(${x(date)}, ${y(value)})`)
                .call(callout, `${formatDate(date)}\n${formatValues(values, type)}`)
        })

        svgElement.on("touchend mouseleave", () => tooltip.call(callout, null))
    }, [])

    return (
        <Container 
            style={style} >
            <p><u><b>{title}</b></u></p>
            <SVG 
                viewBox={`0 0 ${width} ${height}`} 
                preserveAspectRatio="xMidYMid meet" 
                ref={svgRef}>
                { data.map((lineData, index) => {
                    return (
                        <path
                            key={`${title}line${index}`} 
                            d={line(lineData)!} 
                            stroke={colors[index]} 
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

function formatValues(values: Dated[], type: string) {
    const labels = ["County", "State", "US"]
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
            return `${labels[index]}: ${str}`
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
  
    const {x, y, width: w, height: h} = text.node().getBBox();
  
    text.attr("transform", `translate(${-w / 2},${15 - y})`);
    path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
  }