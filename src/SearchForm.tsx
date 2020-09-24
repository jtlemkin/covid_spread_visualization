import React, { useState } from 'react'
import styled from 'styled-components'
import { SearchField, ScrollableList } from './atoms/ScrollableList'
import places from './data/places.json'
import { Expandable } from './atoms/Expandable'
import { Place } from './interfaces'
import PlaceFactory from './PlaceFactory'
import CSS from 'csstype'

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: center;
`

const Container = styled.div`
  width: 100%;
  color: #f1f1f1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

interface SearchFormProps {
    selectCounty: (fips: number) => void,
    style?: CSS.Properties
}

export const SearchForm = ({ selectCounty, style }: SearchFormProps) => {
    const [isDropdownShown, setIsDropdownShown] = useState(false)
    const [hasFormBeenClicked, setHasFormBeenClicked] = useState(false)
    const [field, setField] = useState('')

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
        <Container style={style}>
            <Row>
                <SearchField field={field} onFocus={onFocus} handleFieldChange={setField} />
            </Row>
            <Expandable 
                isExpanded={isDropdownShown && field.length > 0} 
                isAnimated={hasFormBeenClicked} 
                height={100}>
                <ScrollableList data={filteredPlaces} onClick={selectCounty}/>
            </Expandable>
        </Container>
    )
}