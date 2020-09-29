import React, { useState, useEffect } from 'react'
import { USMap } from './USMap'
import { SearchForm } from './SearchForm'
import useCovidData from './hooks/useCovidData'
import { Spinner } from './atoms/Spinner'
import { AdaptiveLayout } from './AdaptiveLayout'
import colors from './colors'
import styled from 'styled-components'
import { Card } from './atoms/Card'
import { getGraphingData } from './helpers/getGraphingData'
import { LabelledSwitch } from './LabelledSwitch'
import { Graph } from './Graph'

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

function App() {
  const [previousFips, setPreviousFips] = useState(0)
  const [currentFips, setSelectedFips] = useState(0)

  const setFips = (newFip: number) => {
    setPreviousFips(currentFips)
    setSelectedFips(newFip)
  }
  
  const [areGraphsDaily, setAreGraphsDaily] = useState(false)
  const [areGraphsRelative, setAreGraphsRelative] = useState(true)
  const [mappingData, graphingData] = useCovidData(currentFips, areGraphsDaily, areGraphsRelative)
  const [percentile, setPercentile] = useState<number | null>(null) // This percentile is used to scale the colors of the map

  useEffect(() => {
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
    const percentile = sortedValues[percentileIndex]
    setPercentile(percentile)
  }, [mappingData])

  const Content = () => {
    if (mappingData !== null && graphingData !== null && percentile !== null) {
      const Master = () => {
        return (
          <div style={{ flex: 1 }}>
            <USMap 
              style={{paddingLeft: '50px', paddingRight: '50px', maxWidth: '1000px'}} 
              previousFips={previousFips} 
              currentFips={currentFips}
              countyData={mappingData}
              percentile={percentile}
              setFips={setFips} />
          </div>
        )
      }

      const switchData = [
        {
          label: "View Daily?",
          value: areGraphsDaily,
          onValueChange: setAreGraphsDaily
        }, {
          label: "View Relative?",
          value: areGraphsRelative,
          onValueChange: setAreGraphsRelative
        }
      ]

      const graphData = getGraphingData(currentFips, graphingData, areGraphsDaily, areGraphsRelative)
    
      const Detail = () => {
        return (
          <div style={{ 
            width: 'calc(100% - 20px)', 
            maxWidth: '400px', 
            marginLeft: '10px', 
            marginRight: '10px', 
            blockSize: 'border-block', 
            margin: '0 auto'
          }}>
            <Card>
              <SearchForm 
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} 
                selectCounty={setFips}/>
            </Card>
            <Card>
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
            </Card>
            <Card>
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
            </Card>
          </div>
        )
      }

      return <AdaptiveLayout master={<Master />} detail={<Detail />} />
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

