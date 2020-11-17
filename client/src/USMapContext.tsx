import React, { createContext, useReducer, useContext } from 'react'

// This whole construct exists for the sole purpose of keeping the timeline's
// current index when the map rerenders. I hate this. React.memo failed me

interface USMapState {
    // This is an offset from the last element in the timeline
    snapshotIndexOffset: number
}

type Action = {type: 'set_snapshot', payload: number}
type Dispatch = (action: Action) => void

const USMapStateContext = createContext<USMapState | undefined>(undefined)
const USMapDispatchContext = createContext<Dispatch | undefined>(undefined)

function usMapReducer(state: USMapState, action: Action) {
    switch(action.type) {
        case 'set_snapshot':
            return {
                ...state,
                snapshotIndexOffset: action.payload
            }
    }
}

interface USMapProviderProps {
    children?: React.ReactNode
}

export function USMapProvider({children}: USMapProviderProps) {
    const [state, dispatch] = useReducer(usMapReducer, {
        snapshotIndexOffset: 0
    })

    return (
        <USMapStateContext.Provider value={state}>
            <USMapDispatchContext.Provider value={dispatch}>
                {children}
            </USMapDispatchContext.Provider>
        </USMapStateContext.Provider>
    )
}

export function useUSMapState() {
    const context = useContext(USMapStateContext)
    if (context === undefined) {
        throw new Error('useUSMapState must be used within a Provider')
    }
    return context
}

export function useUSMapDispatch() {
    const context = useContext(USMapDispatchContext)
    if (context === undefined) {
        throw new Error('useUSMapDispatch must be used within a Provider')
    }
    return context
}