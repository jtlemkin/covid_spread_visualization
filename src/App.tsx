import React, { useState } from 'react'
import './App.css'
import { USMap } from './USMap'
import { SearchForm } from './SearchForm'
import useCovidData from './hooks/useCovidData'
import { Spinner } from './Spinner'
import { GraphDashboard } from './GraphDashboard'
import { AdaptiveLayout } from './AdaptiveLayout'

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
    <div className="App">
      <Content />
    </div>
  )
}

export default App;
