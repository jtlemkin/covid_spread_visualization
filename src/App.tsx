import React, { useState } from 'react'
import './App.css'
import { USMap } from './USMap'
import { Header } from './Header'
import useCovidData from './hooks/useCovidData'
import { Spinner } from './Spinner'
import { GraphDashboard } from './GraphDashboard'

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
          <GraphDashboard data={graphingData} fips={currentFips} />
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
