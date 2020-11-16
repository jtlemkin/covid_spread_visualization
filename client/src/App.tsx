import React, { useState } from 'react'
import { USMap } from './USMap'
import useCovidData from './hooks/useCovidData'
import { Spinner } from './atoms/Spinner'
import { AdaptiveLayout } from './AdaptiveLayout'
import colors from './colors'
import { getGraphData } from './helpers/getGraphData'
import PlaceFactory from './helpers/PlaceFactory'
import { CardList } from './CardList'
import { RadioButtons } from './RadioButtons'
import { Graph } from './Graph'
import { SearchForm } from './SearchForm'
import styled from 'styled-components'

const Container = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${colors.background}
`

const Column = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: left;
`

const PaddedBackground = styled.div`
  height: 100%;
  max-height: 100%;
  background-color: ${colors.background};
  padding-top: 10px;
`

const CardHeader = styled.h4`
  width: 100%;
  border-bottom-style: solid;
  border-bottom-color: black;
  border-bottom-width: thin;
  margin-top: 10px;
  margin-bottom: 5px;
  font-size: 1.1em;
`

const App = () => {
  const [previousFips, setPreviousFips] = useState(0)
  const [currentFips, setSelectedFips] = useState(0)

  const setFips = (newFip: number) => {
    setPreviousFips(currentFips)
    setSelectedFips(newFip)
  }

  const [areGraphsTotal, setAreGraphsTotal] = useState(true)
  const [areGraphsRelative, setAreGraphsRelative] = useState(true)
  const [areGraphsValuesCases, setAreGraphsValuesCases] = useState(true)
  const [typeOfPrediction, setTypeOfPrediction] = useState("cases")
  const covidData = useCovidData(
    currentFips,
    areGraphsTotal,
    areGraphsRelative,
    areGraphsValuesCases,
    typeOfPrediction
  )
  const {mappingData, graphingData, percentile} = covidData

  const title = () => {
    const descriptor = typeOfPrediction === "cases" ? "Reported" : "Predicted"
    const place = PlaceFactory(currentFips).name.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ')
    const daily = areGraphsTotal ? '' : 'Daily'
    const unit = areGraphsRelative ? 'Rates' : 'Numbers'
    const death = areGraphsValuesCases ? '' : 'Death'

    return `${descriptor} ${daily} ${place} COVID-19 ${death} ${unit}`
  }

  const indexOfChartToShow = areGraphsValuesCases ? 0 : 1

  const Content = () => {
    if (mappingData !== null && graphingData !== null && percentile !== null) {
      const Master = () => {
        return (
          <div style={{ flex: 1, paddingRight: 10, paddingLeft: 10 }}>
            <USMap
              style={{ maxWidth: '800px' }}
              title={title()}
              previousFips={previousFips}
              currentFips={currentFips}
              countyData={mappingData}
              setFips={setFips}
              percentile={percentile}
              whichPrediction={typeOfPrediction} />
          </div>
        )
      }

      const urls = [
        "cases",
        "mask",
        "social_distance",
        "contact_tracing",
        "mandatory_masking",
        "strict_social_distance"
      ]

      const setTypeOfPredictionFromIndex = (index: number) => {
        setTypeOfPrediction(urls[index])
      }

      const Control = () => {
        return (
          <PaddedBackground>
            <CardList>
              <SearchForm
                style={{ width: '100%', paddingTop: '10px', paddingBottom: '10px', boxSizing: 'border-box' }}
                selectCounty={setFips} />

              <Column>
                <CardHeader style={{ alignSelf: 'flex-start' }}>
                  What if we used...
                </CardHeader>
                <RadioButtons
                  labels={[
                    "Nothing Different",
                    "Moderate Mask Usage",
                    "Mandated Mask Usage",
                    "Contact Tracing",
                    "Moderate Social Distancing",
                    "Strict Social Distancing"
                  ]}
                  onChange={setTypeOfPredictionFromIndex}
                  checkedIndex={urls.indexOf(typeOfPrediction)}
                  style={{ width: '100%'}} />
              </Column>

              <Column>
                <CardHeader style={{ alignSelf: 'flex-start' }}>
                  I Want to View Data as...
                  </CardHeader>
                {switchData.map(data => {
                  return (
                    <RadioButtons
                      key={`Switch${data.labels[0]}${data.labels[1]}`}
                      labels={data.labels}
                      onChange={data.onValueChange}
                      checkedIndex={data.checkedIndex!}
                      style={{ width: '100%' }} />
                  )
                })}
              </Column>

              <Graph
                style={{ width: '100%' }}
                data={graphData[indexOfChartToShow].values}
                title={graphData[indexOfChartToShow].title}
                type={graphData[indexOfChartToShow].type} />

              <div style={{ textAlign: 'left' }}>
                <CardHeader>How To Use</CardHeader>
                <p>This is a map for visualizing and predicting the spread of COVID-19.</p>
                <p>By default it shows the percent of counties infected since the start of the pandemic, but there are options you can toggle that change this.</p>
                <p>Click on the map to zoom into the states and counties that you wish to see data for. </p>
                <p>Additionally you can search for cities, states and counties in the search places bar.</p>
                <p>Drag the timeline at the bottom of the map to see the changing COVID-19 numbers over time. </p>
              </div>

              <div style={{ textAlign: 'left' }}>
                <CardHeader>Acknowledgments</CardHeader>
                <p>COVID-19 Predictions Provided by Houman Homayoun of UC Davis and Sai Manoj of George Mason University</p>
                <p>Designed and Developed by James Lemkin</p>
                <p>Data provided from the New York Times</p>
              </div>
            </CardList>
          </PaddedBackground>
        )
      }

      // The variable x is never used, we just include it so that the 
      // function types match
      const switchData = [
        {
          labels: ["Total Data", "Daily Data"],
          checkedIndex: areGraphsTotal ? 0 : 1,
          onValueChange: (x: number) => {
            setAreGraphsTotal(x === 0)
          }
        }, {
          labels: ["Percentages of County", "Total in County"],
          checkedIndex: areGraphsRelative ? 0 : 1,
          onValueChange: (x: number) => {
            setAreGraphsRelative(x === 0)
          }
        }, {
          labels: ["Infections", "Deaths"],
          checkedIndex: areGraphsValuesCases ? 0 : 1,
          onValueChange: (x: number) => {
            setAreGraphsValuesCases(x === 0)
          },
        }
      ]

      const graphData = getGraphData(graphingData, areGraphsTotal, areGraphsRelative)

      return <AdaptiveLayout master={<Master />} detail={<Control />} />
    } else {
      return <AdaptiveLayout master={<div style={{padding: 30}}><Spinner /></div>} />
    }
  }

  return (
    <Container>
      <Content />
    </Container>
  )
}

export default App;

