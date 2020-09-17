import React, { useState } from 'react'
import './App.css'
import { USMap } from './USMap'
import { Header } from './Header'

function App() {
  const [previousFips, setPreviousFips] = useState(0)
  const [currentFips, setSelectedFips] = useState(0)

  const setFips = (newFip: number) => {
    setPreviousFips(currentFips)
    setSelectedFips(newFip)
  } 

  return (
    <div className="App">
      <Header selectCounty={setFips} />
      <USMap 
        style={{padding: '25px', maxWidth: '1000px'}} 
        previousFips={previousFips} 
        currentFips={currentFips}
        setFips={setFips} />
    </div>
  )
}

export default App;
