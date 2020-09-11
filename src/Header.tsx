import React, { useState } from 'react'
import styled from 'styled-components'
import { SearchForm, FilterableList } from './FilterableList'
import places from './places.json'
import PropTypes, { InferProps } from "prop-types"

const Title = styled.h2`
  text-align: 'center';
  font-size: 1.2em;
  padding-right: 10px;
`

const Container = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  background: #555;
  color: #f1f1f1;
  display: flex;
  align-items: baseline;
  justify-content: center;
`

const Dropdown = styled.div`
    float: left;
`

const DropdownContent = styled.div`
    display: block;
    position: absolute;
    z-index: 1;
    width: 150px;
`

export function Header({selectCounty}) {
    const [isDropdownShown, setIsDropdownShown] = useState(false)

    const onFocus = (isFocused: boolean) => {
        if (isFocused !== isDropdownShown) {
            setIsDropdownShown(!isDropdownShown)
        }
    }

    return (
        <Container>
            <Title>Covid-19, </Title>
            <Dropdown>
                <SearchForm field='United States' onFocus={onFocus} />
                {isDropdownShown && 
                    <DropdownContent>
                        <FilterableList data={places} onClick={selectCounty}/>
                    </DropdownContent>
                }
            </Dropdown>
        </Container>
    )
}

Header.propTypes = {
    selectCounty: PropTypes.func.isRequired
}