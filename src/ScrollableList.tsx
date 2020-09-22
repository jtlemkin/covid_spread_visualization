import React, { useEffect, useRef } from 'react'
import PropTypes, { InferProps } from "prop-types"
import styled from 'styled-components'
import { Place } from './interfaces'

const Scrollable = styled.div`
    height: 100%;
    width: 100%;
    overflow-y: scroll;
    background: black; 
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
            handleFieldChange(event.target.value)
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

export function ScrollableList({ data, onClick }: FilterableListProps) {
    return (
        <Scrollable>
            <List>
                {data.map(item => {
                    return (
                        <li key={item.fips + item.name}>
                            <button onClick={() => { onClick(item.fips) }}>
                                {item.name}
                            </button>
                        </li>
                    )
                })}
            </List>
        </Scrollable>
    )
}

interface FilterableListProps {
    data: Place[],
    onClick: (id: number) => void
}

ScrollableList.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.exact({label: PropTypes.string.isRequired, id: PropTypes.number.isRequired}).isRequired
    ).isRequired,
}