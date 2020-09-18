import React, { useState } from 'react'
import './App.css'
import { USMap } from './USMap'
import { Header } from './Header'
import useCovidData from './hooks/useCovidData'
import useCSV from './hooks/useCSV'
import { Spinner } from './Spinner'
import { Graph } from './Graph'
import styled from 'styled-components'

const Row = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: row;
`

const PaddedGraph = styled.div`
  padding-left: 10px;
  padding-right: 1
`

function App() {
  const [previousFips, setPreviousFips] = useState(0)
  const [currentFips, setSelectedFips] = useState(0)

  const setFips = (newFip: number) => {
    setPreviousFips(currentFips)
    setSelectedFips(newFip)
  }
  
  const [countyData, isLoading] = useCovidData()
  const nationData = useCSV('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv')

  return (
    <div className="App">
      <Header selectCounty={setFips} />
      { countyData && nationData ? (
        <>
          <USMap 
            style={{padding: '25px', maxWidth: '1000px'}} 
            previousFips={previousFips} 
            currentFips={currentFips}
            countyData={countyData}
            setFips={setFips} />
          <Row>
            <Graph data={nationData} yName='cases' title="Number of cases in US" color={'red'}/>
            <Graph data={nationData} yName='deaths' title="Number of deaths in US" color={'blue'}/>
          </Row>
        </>
      ) : (
        <Spinner />
      ) }
    </div>
  )
}

export default App;
