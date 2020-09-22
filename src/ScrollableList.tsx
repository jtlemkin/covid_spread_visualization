import React, { useEffect, useRef } from 'react'
import PropTypes, { InferProps } from "prop-types"
import styled from 'styled-components'
import { Place } from './interfaces'

const Scrollable = styled.div`
    height: 100%;
    width: 100%;
    overflow-y: scroll;
`

const Input = styled.input`
    border-color: black;
    border-radius: 1px;
    font-size: 1.2em;
    width: 100%;
`

const List = styled.ul`
    padding-inline-start: 0px;  
`

export function SearchField({
    field, 
    handleFieldChange,
    onFocus
}: InferProps<typeof SearchField.propTypes>) {
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
        <form style={{width: '100%'}}>
            <label style={{width: '100%'}}>
                <Input ref={ref} type="text" value={field} onChange={onChange} />
            </label>
        </form>
    )
}

SearchField.propTypes = {
    field: PropTypes.string.isRequired,
    handleFieldChange: PropTypes.func,
    onFocus: PropTypes.func,
}

export function ScrollableList({ data, onClick }: ScrollableListProps) {
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

interface ScrollableListProps {
    data: Place[],
    onClick: (id: number) => void
}