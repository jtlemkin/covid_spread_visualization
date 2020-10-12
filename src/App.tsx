import React, { useState, useMemo } from 'react'
import { USMap } from './USMap'
import useCovidData from './hooks/useCovidData'
import { Spinner } from './atoms/Spinner'
import { AdaptiveLayout } from './AdaptiveLayout'
import colors from './colors'
import { getGraphingData } from './helpers/getGraphingData'
import PlaceFactory from './helpers/PlaceFactory'
import { CardList } from './CardList'
import { LabelledSwitch } from './LabelledSwitch'
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

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const App = () => {
  const [previousFips, setPreviousFips] = useState(0)
  const [currentFips, setSelectedFips] = useState(0)

  const setFips = (newFip: number) => {
    setPreviousFips(currentFips)
    setSelectedFips(newFip)
  }
  
  const [areGraphsDaily, setAreGraphsDaily] = useState(false)
  const [areGraphsRelative, setAreGraphsRelative] = useState(true)
  const [mappingData, graphingData] = useCovidData(currentFips, areGraphsDaily, areGraphsRelative)

  const percentile = useMemo(() => {
    if (mappingData === null) {
      return
    }

    const sortedValues = mappingData.snapshots.map(snapshot => {
        const values: number[] = []
        
        snapshot.statistics.forEach(value => {
          values.push(value)
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
    const daily = areGraphsDaily ? 'Daily' : ''
    const unit = areGraphsRelative ? 'Rates' : 'Numbers'

    return `Reported ${daily} ${place} Covid-19 ${unit}`
  }

  const Content = () => {
    if (mappingData !== null && graphingData !== null && percentile !== undefined) {
      const Master = () => {
        return (
          <div style={{ flex: 1 }}>
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
          <CardList>
            <SearchForm 
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} 
              selectCounty={setFips}/>
            <Row>
                {switchData.map(data => {
                    return (
                        <LabelledSwitch 
                            key={`Switch${data.label}`}
                            label={data.label} 
                            onChange={data.onValueChange} 
                            checked={data.value} />
                    )
                })}
            </Row>
            <Column>
              {graphData.map(data => {
                  return (
                      <Graph
                          key={`Graph${data.title}`}
                          style={{ width: '100%' }}
                          data={data.values}
                          title={data.title}
                          color={data.color}
                          type={data.type} />
                  )
              })}
            </Column>
          </CardList>
        )
      }

      const switchData = [
        {
          label: "View Daily Numbers?",
          value: areGraphsDaily,
          onValueChange: setAreGraphsDaily
        }, {
          label: "View Percentages?",
          value: areGraphsRelative,
          onValueChange: setAreGraphsRelative
        }
      ]

      const graphData = getGraphingData(currentFips, graphingData, areGraphsDaily, areGraphsRelative)

      return <AdaptiveLayout master={<Master />} detail={<Control />} />
    } else {
      return <Spinner />
    }
  }

  return (
    <Container>
      <Content />
    </Container>
  )
}

export default App;

