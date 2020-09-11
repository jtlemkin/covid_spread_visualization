import React, { useState, useEffect, useRef } from 'react'
import PropTypes, { InferProps } from "prop-types"
import styled from 'styled-components'
import useWindowSize from './useWindowSize'

const FixedDiv = styled.div`
    flex: 0;
    height: 400px;
`

const Scrollable = styled.div`
    height: 100%;
    width: 100%;
    overflow-y: scroll;
    background: #555; 
`

const Input = styled.input`
    border: none;
    border-radius: 3px;
    font-size: 1.2em;
    width: 150px;
`

const List = styled.ul`
    padding-inline-start: 0px;  
`

export function SearchForm({
    field, 
    handleFieldChange,
    onFocus
}: InferProps<typeof SearchForm.propTypes>) {
    const onChange = (event: any) => {
        if (handleFieldChange !== null && handleFieldChange !== undefined) {
            handleFieldChange(event)
        }
    }

    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (onFocus) {
            const onFocusTrue = () => {
                onFocus(true)
            }
    
            const onFocusFalse = () => {
                onFocus(false)
            }

            const form = ref.current
            form?.addEventListener('focusin', onFocusTrue)
            form?.addEventListener('focusout', onFocusFalse)

            return () => {
                form?.removeEventListener('focusin', onFocusTrue)
                form?.removeEventListener('focusout', onFocusFalse)
            }
        }
    })

    return (
        <form>
            <label>
                <Input ref={ref} type="text" value={field} onChange={onChange} />
            </label>
        </form>
    )
}

SearchForm.propTypes = {
    field: PropTypes.string.isRequired,
    handleFieldChange: PropTypes.func,
    onFocus: PropTypes.func,
}

export function FilterableList({ data, onClick }: FilterableListProps) {
    const windowSize = useWindowSize()

    const [field, setField] = useState('')
    const handleFieldChange = (event: any) => {
        setField(event.target.value)
    }

    const filteredData = data.filter(item => item.label.toLowerCase().startsWith(field.toLowerCase()))

    return (
        <FixedDiv>
            <Scrollable>
                <List>
                    {filteredData.map(item => {
                        return (
                            <li key={item.id + item.label}>
                                <button onClick={() => { onClick(item.id) }}>
                                    {item.label}
                                </button>
                            </li>
                        )
                    })}
                </List>
            </Scrollable>
        </FixedDiv>
    )
}

interface FilterableListProps {
    data: Array<DataPoint>,
    onClick: (id: number) => void
}

interface DataPoint {
    label: string,
    id: number,
}

FilterableList.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.exact({label: PropTypes.string.isRequired, id: PropTypes.number.isRequired}).isRequired
    ).isRequired,
}