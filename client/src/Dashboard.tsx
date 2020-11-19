import React from 'react'
import { USMap } from './USMap'
import useCovidData from './hooks/useCovidData'
import { Spinner } from './atoms/Spinner'
import { AdaptiveLayout } from './AdaptiveLayout'
import colors from './colors'
import styled from 'styled-components'
import { useDashboardState } from './DashboardContext'
import { Control } from './Control'

const Container = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${colors.background}
`

export default function Dashboard() {
  const state = useDashboardState()

  const covidData = useCovidData(state.currentFips, state.viewingParams)
  const { mappingData, graphingData, percentile, isFetchingCovidData } = covidData


  return (
    <Container>
        <AdaptiveLayout 
          master={
            <div style={{ flex: 1, paddingRight: 10, paddingLeft: 10 }}>
              { !isFetchingCovidData ? (
                <USMap
                  style={{ maxWidth: '800px' }}
                  countyData={mappingData!}
                  percentile={percentile!} />
              ) : (
                <div style={{padding: 30}}><Spinner /></div>
              ) }
            </div>
          }
          detail={<Control graphingData={graphingData}/>}/>
    </Container>
  )
}