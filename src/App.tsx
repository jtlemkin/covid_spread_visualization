import React, { useState } from 'react'
import { USMap } from './USMap'
import { SearchForm } from './SearchForm'
import useCovidData from './hooks/useCovidData'
import { Spinner } from './atoms/Spinner'
import { GraphDashboard } from './GraphDashboard'
import { AdaptiveLayout } from './AdaptiveLayout'
import colors from './colors'
import styled from 'styled-components'
import { Card } from './atoms/Card'
import { DataEntry } from './interfaces'
import PlaceFactory from './PlaceFactory'
import moment from 'moment'

const Container = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${ colors.background }
`

function App() {
  const [previousFips, setPreviousFips] = useState(0)
  const [currentFips, setSelectedFips] = useState(0)

  const setFips = (newFip: number) => {
    setPreviousFips(currentFips)
    setSelectedFips(newFip)
  }
  
  const [mappingData, graphingData] = useCovidData(currentFips)
  const [areGraphsDaily, setAreGraphsDaily] = useState(false)
  const [areGraphsRelative, setAreGraphsRelative] = useState(false)

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

      const switchData = [
        {
          label: "View Daily?",
          value: areGraphsDaily,
          onValueChange: setAreGraphsDaily
        }, {
          label: "View Relative?",
          value: areGraphsRelative,
          onValueChange: setAreGraphsRelative
        }
      ]

      const graphData = getGraphingData(currentFips, graphingData, areGraphsDaily, areGraphsRelative)
    
      const Detail = () => {
        return (
          <div style={{ width: 'calc(100% - 20px)', maxWidth: '400px', marginLeft: '10px', marginRight: '10px', blockSize: 'border-block', margin: '0 auto'}}>
            <Card>
              <SearchForm style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} selectCounty={setFips}/>
            </Card>
            <Card>
              <GraphDashboard 
                graphData={graphData}
                switchData={switchData} />
            </Card>
          </div>
        )
      }

      return <AdaptiveLayout master={<Master />} detail={<Detail />} />
    } else {
      return <Spinner />
    }
  }

  return (
    <Container>
      <Content />
    </Container>
  )
}

export default App;

const getGraphingData = (fips: number, data: DataEntry[][], isDailyData: boolean, isRelativeData: boolean) => {
  const [countyData, stateData, nationData] = data
  const selectedPlaceType = fips === 0 ? "nation" : (fips % 1000 === 0 ? "state" : "county")

  const choices = {
    county: countyData,
    state: stateData,
    nation: nationData
  }

  let graphingData = [choices[selectedPlaceType]]

  if (isRelativeData) {
      if (selectedPlaceType === "county") {
          graphingData.push(choices["state"])
          graphingData.push(choices["nation"])
      } else if (selectedPlaceType === "state") {
          graphingData.push(choices["nation"])
      }

      const selectedPlace = PlaceFactory(fips)

      const populations = [
          selectedPlace.getPopulation(), 
          selectedPlace.getOwner()?.getPopulation(),
          selectedPlace.getOwner()?.getOwner()?.getPopulation()
      ]

      graphingData = graphingData.map((lineData, index) => {
          return lineData.map(dataEntry => {
              return {
                  ...dataEntry,
                  cases: dataEntry.cases / populations[index]!,
                  deaths: dataEntry.deaths / populations[index]!
              } as DataEntry
          })
      })
  }

  if (isDailyData) {
      graphingData = graphingData.map(lineData => {
          return lineData.map((dataEntry, index) => {
              if (index === 0) {
                  return dataEntry
              } else {
                  return {
                      ...dataEntry,
                      cases: dataEntry.cases - lineData[index - 1].cases,
                      deaths: dataEntry.cases - lineData[index - 1].cases
                  }
              }
          })
      })
  }

  const graphData = [
    {
      values: graphingData.map(lineData => lineData.map(entry => {
        return {
          value: entry.cases,
          date: new Date(entry.date)
        }
      })),
      title: isRelativeData ? (
        isDailyData ? "Percent Infected Daily" : "Total Percent Infected"
      ) : (
        isDailyData ? "Daily Infections" : "Total Infections"
      ),
      color: colors.primary
    },
    {
      values: graphingData.map(lineData => lineData.map(entry => {
        return {
          value: entry.deaths,
          date: new Date(entry.date)
        }
      })),
      title: isRelativeData ? (
        isDailyData ? "Percent Daily Deaths" : "Total Death Percentage"
      ) : (
        isDailyData ? "Daily Deaths" : "Total Deaths"
      ),
      color: colors.text.onSurface
    }
  ]

  return graphData
}