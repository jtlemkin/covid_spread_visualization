import React, { useState } from 'react'
import PropTypes, { InferProps } from "prop-types"
import styled from 'styled-components'
import useWindowSize from './useWindowSize'

const FixedDiv = styled.div`
    flex: 0;
`

const Scrollable = styled.div`
    height: 95%;
    width: 200px;
    overflow-y: scroll;
`

function SearchForm({
    field, 
    handleFieldChange
}: InferProps<typeof SearchForm.propTypes>) {
    const onChange = (event: any) => {
        if (handleFieldChange !== null && handleFieldChange !== undefined) {
            handleFieldChange(event)
        }
    }

    return (
        <form>
            <label>
                County:
                <input type="text" value={field} onChange={onChange} />
            </label>
        </form>
    )
}

SearchForm.propTypes = {
    field: PropTypes.string.isRequired,
    handleFieldChange: PropTypes.func,
}

export function FilterableList({ data, onClick }: FilterableListProps) {
    const windowSize = useWindowSize()

    const [field, setField] = useState('')
    const handleFieldChange = (event: any) => {
        setField(event.target.value)
    }

    const filteredData = data.filter(item => item.label.toLowerCase().startsWith(field.toLowerCase()))

    return (
        <FixedDiv style={{height: windowSize.height}}>
            <SearchForm field={field} handleFieldChange={handleFieldChange} />
            <Scrollable>
                <ul>
                    {filteredData.map((item, index) => {
                        return (
                            <li key={item.id + item.label}>
                                <button onClick={() => { onClick(item) }}>
                                    {item.label}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </Scrollable>
        </FixedDiv>
    )
}

interface FilterableListProps {
    data: Array<DataPoint>,
    onClick: (item: DataPoint) => void
}

interface DataPoint {
    label: string,
    id: string,
}

FilterableList.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.exact({label: PropTypes.string.isRequired, id: PropTypes.string.isRequired}).isRequired
    ).isRequired,
}