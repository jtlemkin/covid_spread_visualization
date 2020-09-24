import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Place } from '../interfaces'
import CSS from 'csstype'
import colors from '../colors'

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
    max-width: 100%;
`

const List = styled.ul`
    padding-inline-start: 0px; 
`

interface SearchFieldProps {
    field: string,
    handleFieldChange: (value: string) => void,
    onFocus: (isFocused: boolean) => void,
    style?: CSS.Properties
}

export function SearchField({
    field, 
    handleFieldChange,
    onFocus,
    style
}: SearchFieldProps) {
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
        <form style={{width: '100%', maxWidth: '100%', margin: '2px', boxSizing: 'border-box'}}>
            <label style={{width: '100%'}}>
                <Input ref={ref} type="text" value={field} onChange={onChange} placeholder="Search" results={0} />
            </label>
        </form>
    )
}

const Button = styled.button`
    background-color: transparent;
    border: none;
    color: ${colors.text.onSurface};
    width: 80%;
    border-style: none none solid none;
    border-width: 1px;
    border-color: ${colors.text.onSurface}
    padding-bottom: 10px;
    padding-top: 10px;
`

export function ScrollableList({ data, onClick }: ScrollableListProps) {
    return (
        <Scrollable>
            <List>
                {data.map(item => {
                    return (
                        <li key={item.fips + item.name}>
                            <Button onClick={() => { onClick(item.fips) }}>
                                {item.name}
                            </Button>
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