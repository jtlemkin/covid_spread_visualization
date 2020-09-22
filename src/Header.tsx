import React, { useState } from 'react'
import styled from 'styled-components'
import { SearchForm, ScrollableList } from './ScrollableList'
import places from './data/places.json'
import PropTypes, { InferProps } from "prop-types"
import { Expandable } from './Expandable'
import { Place } from './interfaces'
import PlaceFactory from './PlaceFactory'

const Title = styled.h2`
  text-align: 'center';
  font-size: 1.2em;
  padding-right: 10px;
`

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: center;
`

const Container = styled.div`
  width: 100%;
  background: black;
  color: #f1f1f1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export function Header({selectCounty}: InferProps<typeof Header.propTypes>) {
    const [isDropdownShown, setIsDropdownShown] = useState(false)
    const [hasFormBeenClicked, setHasFormBeenClicked] = useState(false)
    const [field, setField] = useState('United States')

    const onFocus = (isFocused: boolean) => {
        if (!hasFormBeenClicked) {
            setHasFormBeenClicked(true)
            setField('')
        }
        
        if (isFocused !== isDropdownShown) {
            setIsDropdownShown(!isDropdownShown)
        }
    }

    const placesUntyped = (places as any)

    const filteredPlaces = !field.length ? [] : (
        Object.keys(places)
            .reduce((places, fips) => {
                if (placesUntyped[fips].toLowerCase().startsWith(field.toLowerCase())) {
                    places.push(PlaceFactory(parseInt(fips)))
                }

                return places
            }, new Array<Place>())
    )

    return (
        <Container>
            <Row>
                <Title>Covid-19, </Title>
                <SearchForm field={field} onFocus={onFocus} handleFieldChange={setField} />
            </Row>
            <Expandable 
                isExpanded={isDropdownShown} 
                isAnimated={hasFormBeenClicked} 
                height={100}>
                <ScrollableList data={filteredPlaces} onClick={selectCounty}/>
            </Expandable>
        </Container>
    )
}

Header.propTypes = {
    selectCounty: PropTypes.func.isRequired
}