import React from 'react'
import * as d3 from 'd3'
import styled from 'styled-components'
import { DataEntry } from './interfaces'
import CSS from 'csstype'

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
    data: DataEntry[][],
    yName: string,
    title: string,
    color: string,
    style?: CSS.Properties
}

export const Graph = ({ data, yName, title, color, style }: GraphProps) => {
    const width = 400
    const height = 200
    const margin = {top: 20, right: 10, bottom: 30, left: 60}

    // The (d as any) usages are just so that I can refer to fields by string value
    const x = d3.scaleUtc()
        .domain(d3.extent(data.flat(), d => new Date(d.date!)) as [Date, Date])
        .range([margin.left, width - margin.right])
    const y = d3.scaleLinear()
        .domain([0, d3.max(data.flat(), d => (d as any)[yName]!)])
        .range([height - margin.bottom, margin.top])
    const line = d3.line<DataEntry>()
        .x(d => x(new Date(d.date!)))
        .y(d => y((d as any)[yName]!))

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

    const colors = [color, '#aaa', 'black']

    return (
        <Container style={style}>
            <h4><u>{title}</u></h4>
            <SVG viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
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