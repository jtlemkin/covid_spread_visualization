import React, { useState } from 'react'
import './App.css'
import { USMap } from './USMap'
import { Header } from './Header'
import useCovidData from './hooks/useCovidData'
import { Spinner } from './Spinner'
import { Graph } from './Graph'
import styled from 'styled-components'

const Row = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: row;
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
      return (
        <>
          <USMap 
            style={{padding: '25px', maxWidth: '1000px'}} 
            previousFips={previousFips} 
            currentFips={currentFips}
            countyData={mappingData}
            setFips={setFips} />
          <Row>
            <Graph data={graphingData} yName='cases' title="Number of cases in US" color={'red'} />
            <Graph data={graphingData} yName='deaths' title="Number of deaths in US" color={'blue'}/>
          </Row>
        </>
      )
    } else {
      return (
        <Spinner />
      )
    }
  }

  return (
    <div className="App">
      <Header selectCounty={setFips} />
      <Content />
    </div>
  )
}

export default App;
