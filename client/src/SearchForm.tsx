import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { SearchField, ScrollableList } from './atoms/ScrollableList'
import { Expandable } from './atoms/Expandable'
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
    const [results, setResults] = useState<Result[]>([])

    const onFocus = (isFocused: boolean) => {
        if (!hasFormBeenClicked) {
            setHasFormBeenClicked(true)
            setField('')
        }
        
        if (isFocused !== isDropdownShown) {
            setIsDropdownShown(!isDropdownShown)
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        const { signal } = controller

        if (field) {
            fetch(`/search/${field}`, { signal })
                .then(res => res.json())
                .then((searchResults: Result[]) => {
                    console.log("RESULTS", searchResults)
                    setResults(searchResults)
                })

            return () => {
                if (controller) {
                    controller.abort()
                }
            }
        } else if (results) {
            setResults([])
        }
    }, [field])

    const onButtonClick = (name: string) => {
        const place = results.find(result => result[0] === name)

        if (place) {
            selectCounty(place[1])
        }
    }

    const names = results.map(result => result[0])

    return (
        <Container style={style}>
            <Row>
                <SearchField 
                    field={field} onFocus={onFocus} 
                    placeholder='Search Places'
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