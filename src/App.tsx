import React, { useState } from 'react'
import './App.css'
import { Map } from './Map'
import { Header } from './Header'

function App() {
  const [previousFips, setPreviousFips] = useState(0)
  const [currentFips, setSelectedFips] = useState(0)

  const selectCounty = (newFip: number) => {
    setPreviousFips(currentFips)
    setSelectedFips(newFip)
  } 

  return (
    <div className="App">
      <Header />
      <Map previousFips={previousFips} currentFips={currentFips}/>
    </div>
  )
}

export default App;
