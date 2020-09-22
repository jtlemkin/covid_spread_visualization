import React, { useState } from 'react'
import './App.css'
import { USMap } from './USMap'
import { SearchForm } from './SearchForm'
import useCovidData from './hooks/useCovidData'
import { Spinner } from './Spinner'
import { GraphDashboard } from './GraphDashboard'
import { AdaptiveLayout } from './AdaptiveLayout'
import colors from './colors'
import styled from 'styled-components'

const Container = styled.div`
  text-align: center;
  height: 100%;
  width: 100%;
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
    
      const Detail = () => {
        return (
          <>
            <SearchForm style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} selectCounty={setFips}/>
            <GraphDashboard data={graphingData} fips={currentFips} />
          </>
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
