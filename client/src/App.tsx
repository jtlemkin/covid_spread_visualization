import React from 'react'
import { DashboardProvider } from './DashboardContext'
import Dashboard from './Dashboard'
import { USMapProvider } from './USMapContext'

const App = () => {
  return (
    <DashboardProvider>
      <USMapProvider>
        <Dashboard key="dashboard"/>
      </USMapProvider>
    </DashboardProvider>
  )
}

export default App;

