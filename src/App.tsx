import React, { useState } from 'react'
import { USMap } from './USMap'
import { SearchForm } from './SearchForm'
import useCovidData from './hooks/useCovidData'
import { Spinner } from './atoms/Spinner'
import { GraphDashboard } from './GraphDashboard'
import { AdaptiveLayout } from './AdaptiveLayout'
import colors from './colors'
import styled from 'styled-components'
import { Card } from './atoms/Card'
import { getGraphingData } from './helpers/getGraphingData'

const Container = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${ colors.background }
`

function App() {
  const [previousFips, setPreviousFips] = useState(0)
  const [currentFips, setSelectedFips] = useState(0)

  const setFips = (newFip: number) => {
    setPreviousFips(currentFips)
    setSelectedFips(newFip)
  }
  
  const [mappingData, graphingData] = useCovidData(currentFips)
  const [areGraphsDaily, setAreGraphsDaily] = useState(false)
  const [areGraphsRelative, setAreGraphsRelative] = useState(false)

  const Content = () => {
    if (mappingData !== null && graphingData !== null) {
      const Master = () => {
        return (
          <div style={{ flex: 1 }}>
            <USMap 
              style={{paddingLeft: '50px', paddingRight: '50px', maxWidth: '1000px'}} 
              previousFips={previousFips} 
              currentFips={currentFips}
              countyData={mappingData}
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
          <div style={{ width: 'calc(100% - 20px)', maxWidth: '400px', marginLeft: '10px', marginRight: '10px', blockSize: 'border-block', margin: '0 auto'}}>
            <Card>
              <SearchForm style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} selectCounty={setFips}/>
            </Card>
            <Card>
              <GraphDashboard 
                graphData={graphData}
                switchData={switchData} />
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

