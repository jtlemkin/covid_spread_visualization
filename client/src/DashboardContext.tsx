import React, { createContext, useReducer, useContext } from 'react'
import { ViewingParams } from './interfaces'

interface DashboardState {
    currentFips: number,
    previousFips: number,
    viewingParams: ViewingParams,
    shouldAnimate: boolean
}

type Action = {type: 'set_fips', payload: number} | {type: 'toggle_total'} | 
    {type: 'toggle_relative'} | {type: 'toggle_cases'} | 
    {type: 'set_prediction', payload: string} | {type: 'finish_animating'}
type Dispatch = (action: Action) => void

const DashboardStateContext = createContext<DashboardState | undefined>(undefined)
const DashboardDispatchContext = createContext<Dispatch | undefined>(undefined)

function dashboardReducer(state: DashboardState, action: Action) {
    switch(action.type) {
        case 'set_fips':
            return {
                ...state,
                previousFips: state.currentFips,
                currentFips: action.payload,
                shouldAnimate: true
            }
        case 'toggle_total':
            return {
                ...state,
                viewingParams: {
                    ...state.viewingParams,
                    isTotal: !state.viewingParams.isTotal
                },
                shouldAnimate: false
            }
        case 'toggle_relative':
            return {
                ...state,
                viewingParams: {
                    ...state.viewingParams,
                    isRelative: !state.viewingParams.isRelative
                },
                shouldAnimate: false
            }
        case 'toggle_cases':
            return {
                ...state,
                viewingParams: {
                    ...state.viewingParams,
                    isCases: !state.viewingParams.isCases
                },
                shouldAnimate: false
            }
        case 'set_prediction':
            return {
                ...state,
                viewingParams: {
                    ...state.viewingParams,
                    predictionType: action.payload
                },
                shouldAnimate: false
            }
        case 'finish_animating':
            return {
                ...state,
                shouldAnimate: false
            }
    }
}

interface DashboardProviderProps {
    children?: React.ReactNode
}

export function DashboardProvider({children}: DashboardProviderProps) {
    const [state, dispatch] = useReducer(dashboardReducer, {
        currentFips: 0,
        previousFips: 0,
        viewingParams: {
            isTotal: true,
            isRelative: true,
            isCases: true,
            predictionType: "cases"
        },
        shouldAnimate: false
    })

    return (
        <DashboardStateContext.Provider value={state}>
            <DashboardDispatchContext.Provider value={dispatch}>
                {children}
            </DashboardDispatchContext.Provider>
        </DashboardStateContext.Provider>
    )
}

export function useDashboardState() {
    const context = useContext(DashboardStateContext)
    if (context === undefined) {
        throw new Error('useDashboardState must be used within a Provider')
    }
    return context
}

export function useDashboardDispatch() {
    const context = useContext(DashboardDispatchContext)
    if (context === undefined) {
        throw new Error('useDashboardDispatch must be used within a Provider')
    }
    return context
}