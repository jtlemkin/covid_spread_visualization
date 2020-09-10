import React from 'react'
import './App.css'
import { Map } from './Map'
import styled from 'styled-components';

const Title = styled.h1`
`

function App() {
  return (
    <div className="App">
      <Title>Covid-19 Social Distancing Effectiveness</Title>
      <Map />
    </div>
  )
}



export default App;
