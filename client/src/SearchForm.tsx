import React, { useState } from 'react'
import styled from 'styled-components'
import { SearchField, ScrollableList } from './atoms/ScrollableList'
import { Expandable } from './atoms/Expandable'
import CSS from 'csstype'
import useFetch from './hooks/useFetch'
import { useDashboardDispatch } from './DashboardContext'

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
    style?: CSS.Properties
}

export const SearchForm = ({ style }: SearchFormProps) => {
    const dispatch = useDashboardDispatch()

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

    const [results, isFetching] = useFetch<Result[]>(`/search/${field}`, true)

    const onButtonClick = (name: string) => {
        if (!results) {
            return
        }

        const place = results.find(result => result[0] === name)

        if (place) {
            let fips = place[1]
            const newYorkCityFips = [36061, 36047, 36081, 36005, 36085]
            if (newYorkCityFips.includes(fips)) {
                fips = 1
            }
            dispatch({type: 'set_fips', payload: fips})
        }
    }

    const names = results ? results.map(result => result[0]) : []

    return (
        <Container style={{...style, paddingTop: 10, paddingBottom: 10}}>
            <Row>
                <SearchField 
                    field={field} onFocus={onFocus} 
                    placeholder='Search Places to View'
                    handleFieldChange={setField} />
            </Row>
            <Expandable 
                isExpanded={isDropdownShown && field.length > 0} 
                isAnimated={hasFormBeenClicked} 
                height={100}>
                <ScrollableList data={names} onClick={onButtonClick}/>
            </Expandable>
        </Container>
    )
}

type Result = [string, number]