import React, { useState, useMemo } from 'react'
import { USMap } from './USMap'
import useCovidData from './hooks/useCovidData'
import { Spinner } from './atoms/Spinner'
import { AdaptiveLayout } from './AdaptiveLayout'
import colors from './colors'
import { getGraphData } from './helpers/getGraphData'
import PlaceFactory from './helpers/PlaceFactory'
import { CardList } from './CardList'
import { RadioButtons } from './RadioButtons'
import { Graph } from './Graph'
import { SearchForm } from './SearchForm'
import styled from 'styled-components'

const Container = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${ colors.background }
`

const Column = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`

const PaddedBackground = styled.div`
  height: 100%;
  max-height: 100%;
  background-color: ${colors.background};
  padding-top: 10px;
`

const App = () => {
  const [previousFips, setPreviousFips] = useState(0)
  const [currentFips, setSelectedFips] = useState(0)

  const setFips = (newFip: number) => {
    setPreviousFips(currentFips)
    setSelectedFips(newFip)
  }
  
  const [areGraphsTotal, setAreGraphsTotal] = useState(true)
  const [areGraphsRelative, setAreGraphsRelative] = useState(true)
  const [areGraphsValuesCases, setAreGraphsValuesCases] = useState(true)
  const [mappingData, graphingData] = useCovidData(currentFips, areGraphsTotal, areGraphsRelative, areGraphsValuesCases)

  const percentile = useMemo(() => {
    if (mappingData === null) {
      return
    }

    // Sort the snapshots so that we can find a percentile that will
    // be used for displaying the values
    const sortedValues = mappingData.snapshots.map(snapshot => {
        const values: number[] = []
        
        Object.values(snapshot.statistics).forEach((value: unknown) => {
          values.push(value as number)
        })

        return values
      })
        .flat()
        .sort((a, b) => a - b)

    const percentileIndex = Math.floor(sortedValues.length * 0.997)
    return sortedValues[percentileIndex]
  }, [mappingData])

  const title = () => {
    const place = PlaceFactory(currentFips).name.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ')
    const daily = areGraphsTotal ? '' : 'Daily'
    const unit = areGraphsRelative ? 'Rates' : 'Numbers'
    const death = areGraphsValuesCases ? '' : 'Death'

    return `Reported ${daily} ${place} Covid-19 ${death} ${unit}`
  }

  // The getGraphData function returns a tuple, the first index
  // contains graph data for cases and the second deaths
  // The getGraphData otherwise controls whether that data is daily
  // and whether it is aggregated
  const indexOfChartToShow = areGraphsValuesCases ? 0 : 1

  const Content = () => {
    if (mappingData !== null && graphingData !== null && percentile !== undefined) {
      const Master = () => {
        return (
          <div style={{ flex: 1, paddingRight: 10, paddingLeft: 10 }}>
            <USMap 
              style={{maxWidth: '875px'}} 
              title={title()}
              previousFips={previousFips} 
              currentFips={currentFips}
              countyData={mappingData}
              setFips={setFips}
              percentile={percentile} />
          </div>
        )
      }

      const Control = () => {
        return (
          <PaddedBackground>
            <CardList>
              <SearchForm 
                style={{ width: '100%', paddingTop: '10px', paddingBottom: '10px', boxSizing: 'border-box' }} 
                selectCounty={setFips}/>
              <Column>
                  {switchData.map(data => {
                      return (
                          <RadioButtons 
                              key={`Switch${data.label1}${data.label2}`}
                              label1={data.label1} 
                              label2={data.label2}
                              onChange={data.onValueChange} 
                              firstChecked={data.value}
                              style={{width: '100%'}} />
                      )
                  })}
              </Column>
              <Graph
                  style={{ width: '100%' }}
                  data={graphData[indexOfChartToShow].values}
                  title={graphData[indexOfChartToShow].title}
                  type={graphData[indexOfChartToShow].type} />
            </CardList>
          </PaddedBackground>
        )
      }

      // The variable x is never used, we just include it so that the 
      // function types match
      const switchData = [
        {
          label1: "Total Data",
          label2: "Daily Data",
          value: areGraphsTotal,
          onValueChange: (x: boolean) => setAreGraphsTotal(!areGraphsTotal)
        }, {
          label1: "Per Capita Data",
          label2: "Absolute Data",
          value: areGraphsRelative,
          onValueChange: (x: boolean) => setAreGraphsRelative(!areGraphsRelative)
        }, {
          label1: "Case Data",
          label2: "Death Data",
          value: areGraphsValuesCases,
          onValueChange: (x: boolean) => setAreGraphsValuesCases(!areGraphsValuesCases),
        }
      ]

      const graphData = getGraphData(currentFips, graphingData, areGraphsTotal, areGraphsRelative)

      return <AdaptiveLayout master={<Master />} detail={<Control />} />
    } else {
      return <AdaptiveLayout master={<div><Spinner /></div>} />
    }
  }

  return (
    <Container>
      <Content />
    </Container>
  )
}

export default App;
