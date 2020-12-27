import React from 'react'
import { DashboardProvider } from './DashboardContext'
import Dashboard from './Dashboard'
import { USMapProvider } from './USMapContext'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'

const appInsights = new ApplicationInsights({ config: {
  instrumentationKey: '0b371f6d-ae30-44bc-a13d-9add82b197e3'
} });
appInsights.loadAppInsights();
appInsights.trackPageView();

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

