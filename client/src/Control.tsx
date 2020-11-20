import React from 'react'
import styled from 'styled-components'
import colors from './colors'
import { CardList } from './CardList'
import { RadioButtons } from './RadioButtons'
import { SearchForm } from './SearchForm'
import { useDashboardState, useDashboardDispatch } from './DashboardContext'
import { DataEntry } from './interfaces'
import { getGraphData } from './helpers/getGraphData'
import { Graph } from './Graph'
import { Spinner } from './atoms/Spinner'

const PaddedBackground = styled.div`
  height: 100%;
  max-height: 100%;
  background-color: ${colors.background};
  padding-top: 10px;
`

const Column = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: left;
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

const StyledSearchForm = styled(SearchForm)`
  width: 100%; 
  paddingTop: 10px;
  paddingBottom: 10px; 
  boxSizing: border-box
`

const Img = styled.img`
  padding: 10px;
`

const urls = [
    "cases",
    "social_distance_plus_mask",
    "mandatory_mask",
    "contact_tracing",
    "strict_social_distance_plus_mask",
    "strict_social_distance"
  ]

interface ControlProps {
    graphingData: DataEntry[][] | null
}

export const Control = ({graphingData}: ControlProps) => {
    const state = useDashboardState()
    const dispatch = useDashboardDispatch()

    const setTypeOfPredictionFromIndex = (index: number) => {
        dispatch({type: "set_prediction", payload: urls[index]})
    }

    const switchData = [
        {
          labels: ["Total Data", "Daily Data"],
          checkedIndex: state.viewingParams.isTotal ? 0 : 1,
          onValueChange: (x: number) => {
            dispatch({type: "toggle_total"})
          }
        }, {
          labels: ["Infections", "Deaths"],
          checkedIndex: state.viewingParams.isCases ? 0 : 1,
          onValueChange: (x: number) => {
            dispatch({type: "toggle_cases"})
          },
        }
    ]

    const graphData = getGraphData(
        graphingData, 
        state.viewingParams.isTotal, 
    )

    // I think there are maybe two graphs for some reason for cases and deaths,
    // and somehow we choose to hide only one
    const indexOfChartToShow = state.viewingParams.isCases ? 0 : 1

    return (
      <PaddedBackground>
        <CardList>
          <StyledSearchForm/>
          <Column>
            <CardHeader style={{ alignSelf: 'flex-start' }}>
              What if we used...
            </CardHeader>
            <RadioButtons
              labels={[
                "Nothing Different",
                "Some Mask Usage and Shut Downs",
                "Strict Mask Usage",
                "Contact Tracing Only",
                "Strict Mask Usage and Shut Downs",
                "Strict Social Distancing"
              ]}
              onChange={setTypeOfPredictionFromIndex}
              checkedIndex={urls.indexOf(state.viewingParams.predictionType)}
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

          { graphData ? (
            <Graph
              style={{ width: '100%' }}
              data={graphData[indexOfChartToShow].values}
              title={graphData[indexOfChartToShow].title} />
          ) : (
            <div style={{padding: 30}}><Spinner /></div>
          )}

          <div style={{ textAlign: 'left' }}>
            <CardHeader>How To Use</CardHeader>
            <p>This website highlights lessons learned from the COVID-19 pandemic by using state of the art AI to show how the spread of the virus could have been changed by making certain policy measures near the beginning of the pandemic.</p>
            <p>In the "What if we used..." section, you can select different measures that change how COVID-19 spreads in the visualization.</p>
            <p>Currently, these parameters show what would happen if we only used the selected measure and no others.</p>
            <p>By default, the map shows the percent of counties infected since the start of the pandemic, but there are options you can toggle that change this.</p>
            <p>Click on the map to zoom into the states and counties that you wish to see data for. </p>
            <p>Additionally you can search for cities, states and counties in the search places bar.</p>
            <p>Drag the timeline at the bottom of the map to see the changing COVID-19 numbers over time. </p>
          </div>

          <div style={{ textAlign: 'left' }}>
            <CardHeader>Acknowledgments</CardHeader>
            <p>Funded by NSF RAPID #2029414</p>
            <p>COVID-19 Predictions Provided by <a href="https://www.ece.ucdavis.edu/~hhomayou/">Professor Houman Homayoun</a> of UC Davis and <a href="http://mason.gmu.edu/~spudukot/">Professor Sai Manoj</a> and <a href="https://www.linkedin.com/in/sreenitha-kasarapu/">Sreenitha Kasarapu</a> of George Mason University</p>
            <p>Designed and Developed by <a href="https://www.linkedin.com/in/jtlemkin/">James Lemkin</a></p>
            <p>Data provided from the <a href="https://github.com/nytimes/covid-19-data">New York Times</a></p>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Img src="/NSF_4-Color_bitmap_Logo.png" alt="NSF Logo" style={{width: '70px'}}/>
              <Img src="/UC-Davis-Logo.png" alt="UC Davis Logo" style={{width: '130px'}}/>
              <Img src="/1024px-George_Mason_University_logo.svg.png" alt="GMU Logo" style={{width: '90px', marginBottom: '15px'}}/>
            </div>
          </div>
        </CardList>
      </PaddedBackground>
    )
  }