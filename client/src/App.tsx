import React from 'react'
import { DashboardProvider } from './DashboardContext'
import Dashboard from './Dashboard'

const App = () => {
 

  return (
    <DashboardProvider>
      <Dashboard/>
    </DashboardProvider>
  )
}

export default App;

