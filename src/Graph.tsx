import React from 'react'
import * as d3 from 'd3'
import styled from 'styled-components'

const Container = styled.div`
    flex: 1;
    max-width: 1000px;
    flex-direction: column;
    align-items: center;
    text-align: center;
`

const SVG = styled.svg`
    width: 100%;
`

interface GraphProps {
    data: d3.DSVRowArray<string> | d3.DSVRowString[],
    yName: string,
    title: string,
    color: string,
}

export const Graph = ({ data, yName, title, color }: GraphProps) => {
    const width = 400
    const height = 200
    const margin = {top: 20, right: 10, bottom: 30, left: 60}

    const x = d3.scaleUtc()
        .domain(d3.extent(data, d => new Date(d.date!)) as [Date, Date])
        .range([margin.left, width - margin.right])
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => parseInt(d[yName]!))!])
        .range([height - margin.bottom, margin.top])
    const line = d3.line<d3.DSVRowString<string>>()
        .x(d => x(new Date(d.date!)))
        .y(d => y(parseInt(d[yName]!)))

    const xAxis = (g: any) => g
        .call(d3.axisBottom(x).ticks(7).tickSizeOuter(0))

    const yAxis = (g: any) => g
        .call(d3.axisLeft(y).ticks(5))

    const xAxisRef = (axis: any) => {
        axis && xAxis(d3.select(axis))
    }
    const yAxisRef = (axis: any) => {
        axis && yAxis(d3.select(axis))
    }

    return (
        <Container>
            <h4><u>{title}</u></h4>
            <SVG viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                <path d={line(data)!} stroke={color} fill="none" strokeWidth="2" strokeMiterlimit="1"></path>
                <g ref={xAxisRef} transform={`translate(0, ${height - margin.bottom})`}></g>
                <g ref={yAxisRef} transform={`translate(${margin.left},0)`}></g>
            </SVG>
        </Container>
    )
}